import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Anthropic from '@anthropic-ai/sdk';
import { Student } from './student.entity';
import { RollCall } from '../schedule/roll-call.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(RollCall)
    private readonly rollCallRepo: Repository<RollCall>,
  ) {}

  // students 테이블 전체 조회
  findAll(): Promise<Student[]> {
    return this.studentRepo.find();
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepo.findOne({ where: { id } });
    if (!student) throw new NotFoundException('학생을 찾을 수 없습니다.');
    return student;
  }

  create(data: Partial<Student>): Promise<Student> {
    return this.studentRepo.save(this.studentRepo.create(data));
  }

  async update(id: number, data: Partial<Student>): Promise<Student> {
    const student = await this.findOne(id);
    Object.assign(student, data);
    return this.studentRepo.save(student);
  }

  async remove(id: number): Promise<void> {
    await this.studentRepo.delete(id);
  }

  // PDF / 이미지 파싱 --------------------------------------------------

  async parseDocument(file: Express.Multer.File): Promise<Partial<Student>[]> {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const base64 = file.buffer.toString('base64');
    const isPdf = file.mimetype === 'application/pdf';

    const contentBlock: Anthropic.MessageParam['content'][number] = isPdf
      ? {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64 },
        } as unknown as Anthropic.DocumentBlockParam
      : {
          type: 'image',
          source: {
            type: 'base64',
            media_type: file.mimetype as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: base64,
          },
        };

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            contentBlock,
            {
              type: 'text',
              text: `이 문서에서 학생 명단을 추출해주세요. 이름은 '성 이름' 순으로 표기하세요. nameKo가 없으면 영어 이름 발음으로 생성하세요.`,
            },
          ],
        },
      ],
      output_config: {
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              students: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    nameJa: { type: 'string', description: '일본어 이름' },
                    nameKo: {
                      anyOf: [{ type: 'string' }, { type: 'null' }],
                    },
                    nameEn: {
                      anyOf: [{ type: 'string' }, { type: 'null' }],
                    },
                    gender: { type: 'string', enum: ['M', 'F'] },
                    roomNumber: {
                      anyOf: [{ type: 'string' }, { type: 'null' }],
                    },
                    notes: {
                      anyOf: [{ type: 'string' }, { type: 'null' }],
                    },
                  },
                  required: [
                    'nameJa',
                    'nameKo',
                    'nameEn',
                    'gender',
                    'roomNumber',
                    'notes',
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ['students'],
            additionalProperties: false,
          },
        },
      },
    });

    const text =
      response.content[0].type === 'text'
        ? response.content[0].text
        : '{"students":[]}';
    const parsed = JSON.parse(text) as { students: Partial<Student>[] };
    return parsed.students;
  }

  // 점호 --------------------------------------------------

  async getRollCall(date: string): Promise<RollCall[]> {
    const students = await this.studentRepo.find();
    const existing = await this.rollCallRepo.find({ where: { date } });
    const existingIds = new Set(existing.map((r) => r.studentId));

    const toCreate = students
      .filter((s) => !existingIds.has(s.id))
      .map((s) =>
        this.rollCallRepo.create({ studentId: s.id, date, isPresent: false }),
      );

    if (toCreate.length) await this.rollCallRepo.save(toCreate);

    return this.rollCallRepo.find({ where: { date }, relations: ['student'] });
  }

  async updateRollCall(id: number, isPresent: boolean): Promise<RollCall> {
    const rollCall = await this.rollCallRepo.findOne({ where: { id } });
    if (!rollCall) throw new NotFoundException('점호 항목을 찾을 수 없습니다.');
    rollCall.isPresent = isPresent;
    return this.rollCallRepo.save(rollCall);
  }
}
