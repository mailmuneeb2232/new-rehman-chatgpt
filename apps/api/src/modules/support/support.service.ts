import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketStatus, UserRole } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(userId: string, dto: CreateTicketDto) {
    if (dto.orderId) {
      const order = await this.prisma.order.findFirst({
        where: { id: dto.orderId, userId },
      });
      if (!order) throw new BadRequestException('Order not found or does not belong to you');
    }

    return this.prisma.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
        priority: dto.priority ?? 'MEDIUM',
        orderId: dto.orderId,
        status: TicketStatus.OPEN,
        messages: {
          create: {
            userId,
            message: dto.message,
            isStaff: false,
          },
        },
      },
      include: { messages: true },
    });
  }

  async getMyTickets(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: { orderBy: { createdAt: 'asc' }, take: 1 },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.supportTicket.count({ where: { userId } }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getTicket(userId: string, ticketId: string, userRole: UserRole) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
        },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        order: { select: { id: true, orderNumber: true } },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    const isStaff = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(userRole);
    if (!isStaff && ticket.userId !== userId) throw new ForbiddenException();

    return ticket;
  }

  async replyToTicket(userId: string, ticketId: string, dto: ReplyTicketDto, isStaff: boolean) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (!isStaff && ticket.userId !== userId) throw new ForbiddenException();
    if (ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException('Cannot reply to a closed ticket');
    }

    const [message] = await this.prisma.$transaction([
      this.prisma.supportMessage.create({
        data: { ticketId, userId, message: dto.message, isStaff },
      }),
      this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: isStaff ? TicketStatus.REPLIED : TicketStatus.OPEN,
          updatedAt: new Date(),
        },
      }),
    ]);

    return message;
  }

  async updateTicketStatus(ticketId: string, dto: UpdateTicketStatusDto) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: dto.status },
    });
  }

  async getAllTickets(page = 1, limit = 20, status?: TicketStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
