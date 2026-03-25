import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
