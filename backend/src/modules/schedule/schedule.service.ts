import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Anthropic from '@anthropic-ai/sdk';
import { Schedule } from './schedule.entity';
import { translateKoToJa } from '../../utils/translate.util';

// Stage 1(추출) 응답 항목 — 한국어 필드만 담긴다
interface ExtractedScheduleItem {
  date: string;
  timeStart: string | null;
  timeEnd: string | null;
  titleKo: string;
  locationKo: string | null;
  managerName: string | null;
  notesKo: string | null;
}

// Stage 2(번역) 응답 항목 — 일본어 필드만 담긴다
interface TranslatedScheduleItem {
  titleJa: string;
  locationJa: string | null;
  notesJa: string | null;
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) {}

  // schedules 테이블 전체 조회 (날짜 → 시작시간 순 정렬)
  findAll(): Promise<Schedule[]> {
    return this.scheduleRepo.find({ order: { date: 'ASC', timeStart: 'ASC' } });
  }

  // schedules 테이블에서 특정 날짜의 일정만 조회 (시작시간 순 정렬)
  findByDate(date: string): Promise<Schedule[]> {
    return this.scheduleRepo.find({
      where: { date },
      order: { timeStart: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepo.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('일정을 찾을 수 없습니다.');
    return schedule;
  }

  create(data: Partial<Schedule>): Promise<Schedule> {
    return this.scheduleRepo.save(this.scheduleRepo.create(data));
  }

  async update(id: number, data: Partial<Schedule>): Promise<Schedule> {
    const schedule = await this.findOne(id);
    Object.assign(schedule, data);
    return this.scheduleRepo.save(schedule);
  }

  async remove(id: number): Promise<void> {
    await this.scheduleRepo.delete(id);
  }

  // 일정 전체 삭제 (schedules 테이블 전 행 삭제, TRUNCATE가 아닌 DELETE라 memos의
  // ON DELETE CASCADE FK 제약과 충돌 없이 정상 동작)
  async removeAll(): Promise<void> {
    await this.scheduleRepo.createQueryBuilder().delete().execute();
  }

  // 선택된 여러 일정을 트랜잭션으로 한 번에 저장 (일부 실패 시 전체 롤백)
  async createMany(data: Partial<Schedule>[]): Promise<Schedule[]> {
    data.forEach((item, i) => {
      // DB 제약(NOT NULL): date, titleJa, locationKo (database/01_schema.sql) —
      // 엔티티는 locationKo를 nullable로 선언하고 있어 실제 스키마와 불일치하므로 여기서 직접 확인
      if (!item.date || !item.titleJa || !item.locationKo) {
        throw new BadRequestException(
          `${i + 1}번째 일정에 date/titleJa/locationKo가 없습니다.`,
        );
      }
    });

    return this.scheduleRepo.manager.transaction(async (manager) => {
      const entities = data.map((item) => manager.create(Schedule, item));
      return manager.save(Schedule, entities);
    });
  }

  // PDF / 이미지 파싱 --------------------------------------------------
  // Stage 1: 문서에서 일정 목록 추출(한국어) → Stage 2: 추출된 한국어 필드를 일본어로 번역
  // (CLAUDE.md 설계 원칙: 추출과 번역은 별도 LLM 호출로 분리, 파일 업로드 시에만 자동 이어붙임)
  async parseDocument(file: Express.Multer.File): Promise<Partial<Schedule>[]> {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const base64 = file.buffer.toString('base64');
    const isPdf = file.mimetype === 'application/pdf';

    const contentBlock: Anthropic.MessageParam['content'][number] = isPdf
      ? ({
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64,
          },
        } as unknown as Anthropic.DocumentBlockParam)
      : {
          type: 'image',
          source: {
            type: 'base64',
            media_type: file.mimetype as
              | 'image/jpeg'
              | 'image/png'
              | 'image/gif'
              | 'image/webp',
            data: base64,
          },
        };

    const extractResponse = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            contentBlock,
            {
              type: 'text',
              text: `이 문서는 프로그램 일정표입니다. 참가자 명단 등 일정과 무관한 다른 표는 무시하고, 날짜별 일정 정보만 추출해주세요.

- 같은 날짜가 여러 행에 걸쳐 병합되어 표시된 경우, 아래 행까지 같은 날짜로 채워주세요.
- 날짜는 문서에 명시된 연도를 사용해 YYYY-MM-DD 형식으로 변환하세요.
- 시각 또는 시각 범위가 명시되어 있으면 HH:MM 형식으로 timeStart/timeEnd에 담고, 범위 표기(구분 기호는 문서마다 다를 수 있음)는 시작/종료로 나누세요. 하루 전체를 의미하는 표현(전일/종일 등, 표현은 문서마다 다를 수 있음)이거나 시간 정보가 없으면 timeStart/timeEnd는 null로 두세요.
- 하나의 일정 항목 안에 시각이 붙은 여러 하위 활동이 순서대로 나열되어 있다면(표기 방식은 문서마다 다를 수 있으니 유연하게 판단하세요), 각 하위 활동을 별도의 일정 항목으로 분리하세요. 이때 각 항목의 titleKo는 상위 활동명과 함께 작성해 맥락을 유지하세요 (예: "상위활동명: 하위활동내용").
- 일정 제목은 titleKo에, 장소는 locationKo에, 담당자/담당조직은 managerName에, 그 외 유의사항은 notesKo에 담아주세요.
- managerName에 저장할 이름에 호칭이 존재 시 호칭이 포함되어야 합니다.(선생님, 교수님 등)
- locationKo가 문서에 명시되지 않은 경우, 다음 규칙만 적용하고 그 외에는 추측하지 마세요:
  - 조식: "생활관"
  - 중식/석식: "미정"
  - 식사가 아닌 학교 내부 일정: "창조관"
  - 그 외: "-"`,
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
              schedules: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    date: { type: 'string', description: 'YYYY-MM-DD' },
                    timeStart: {
                      anyOf: [{ type: 'string' }, { type: 'null' }],
                    },
                    timeEnd: {
                      anyOf: [{ type: 'string' }, { type: 'null' }],
                    },
                    titleKo: { type: 'string' },
                    locationKo: {
                      anyOf: [{ type: 'string' }, { type: 'null' }],
                    },
                    managerName: {
                      anyOf: [{ type: 'string' }, { type: 'null' }],
                    },
                    notesKo: { anyOf: [{ type: 'string' }, { type: 'null' }] },
                  },
                  required: [
                    'date',
                    'timeStart',
                    'timeEnd',
                    'titleKo',
                    'locationKo',
                    'managerName',
                    'notesKo',
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ['schedules'],
            additionalProperties: false,
          },
        },
      },
    });

    const extractText =
      extractResponse.content[0].type === 'text'
        ? extractResponse.content[0].text
        : '{"schedules":[]}';
    const extracted = (
      JSON.parse(extractText) as { schedules: ExtractedScheduleItem[] }
    ).schedules;

    if (extracted.length === 0) return [];

    const translateResponse = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `다음은 일정 안내문에 들어갈 한국어 문구 목록입니다. 각 항목을 자연스러운 일본어로 번역해주세요. 입력 배열과 같은 순서, 같은 개수로 응답하세요.\n\n${JSON.stringify(
            extracted.map((s) => ({
              titleKo: s.titleKo,
              locationKo: s.locationKo,
              notesKo: s.notesKo,
            })),
          )}`,
        },
      ],
      output_config: {
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              translations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    titleJa: { type: 'string' },
                    locationJa: {
                      anyOf: [{ type: 'string' }, { type: 'null' }],
                    },
                    notesJa: { anyOf: [{ type: 'string' }, { type: 'null' }] },
                  },
                  required: ['titleJa', 'locationJa', 'notesJa'],
                  additionalProperties: false,
                },
              },
            },
            required: ['translations'],
            additionalProperties: false,
          },
        },
      },
    });

    const translateText =
      translateResponse.content[0].type === 'text'
        ? translateResponse.content[0].text
        : '{"translations":[]}';
    const translations = (
      JSON.parse(translateText) as { translations: TranslatedScheduleItem[] }
    ).translations;

    if (translations.length !== extracted.length) {
      throw new BadRequestException(
        '번역 결과 개수가 추출된 일정 개수와 일치하지 않습니다. 다시 시도해주세요.',
      );
    }

    return extracted.map((item, i) => ({
      date: item.date,
      timeStart: item.timeStart,
      timeEnd: item.timeEnd,
      titleKo: item.titleKo,
      titleJa: translations[i].titleJa,
      locationKo: item.locationKo,
      locationJa: translations[i].locationJa,
      managerName: item.managerName,
      notesKo: item.notesKo,
      notesJa: translations[i].notesJa,
    }));
  }

  // 폼 직접 입력 중 필드별 "번역" 버튼 트리거 전용 (단일 텍스트만 좁게 번역, 문서 추출과 무관)
  translateText(text: string): Promise<string> {
    return translateKoToJa(text);
  }
}
