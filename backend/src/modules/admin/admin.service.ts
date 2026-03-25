import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { Admin } from './admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  findAll(): Promise<Admin[]> {
    return this.adminRepo.find({ select: ['id', 'name', 'studentId', 'phone', 'role', 'createdAt'] });
  }

  findOne(id: number): Promise<Admin | null> {
    return this.adminRepo.findOne({ where: { id } });
  }

  async login(studentId: string, password: string): Promise<{ accessToken: string }> {
    const admin = await this.adminRepo.findOne({ where: { studentId } });
    if (!admin) throw new UnauthorizedException('존재하지 않는 계정입니다.');

    const hashed = crypto.createHash('sha256').update(password).digest('hex');
    if (admin.password !== hashed) throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');

    const payload = { sub: admin.id, role: admin.role };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async create(data: Partial<Admin>): Promise<Admin> {
    if (data.password) {
      data.password = crypto.createHash('sha256').update(data.password).digest('hex');
    }
    const admin = this.adminRepo.create(data);
    return this.adminRepo.save(admin);
  }

  async update(id: number, data: Partial<Admin>): Promise<Admin> {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('관리자를 찾을 수 없습니다.');
    if (data.password) {
      data.password = crypto.createHash('sha256').update(data.password).digest('hex');
    }
    Object.assign(admin, data);
    return this.adminRepo.save(admin);
  }

  async remove(id: number): Promise<void> {
    await this.adminRepo.delete(id);
  }
}
