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
              text: `이 문서에서 학생 명단을 추출해 JSON 배열로만 반환해주세요. 다른 텍스트는 포함하지 마세요.
각 학생 객체 필드:
- nameJa: string (일본어 이름, 필수)
- nameKo: string | null (한국어 이름, 없으면 영어 이름 발음으로 생성)
- nameEn: string | null (영어 이름)
- gender: "M" | "F"
- roomNumber: string | null (방 번호)
- notes: string | null (주의사항)

JSON 배열만 출력:`,
            },
          ],
        },
      ],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text.trim() : '[]';

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
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
