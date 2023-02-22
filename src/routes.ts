import { FastifyInstance } from "fastify";
import { prisma } from "./lib/prisma";
import { z } from "zod";
import dayjs from "dayjs";
import { warnEnvConflicts } from "@prisma/client/runtime";

export async function appRoutes(app: FastifyInstance) {
  // Route to creating habits
  app.post("/habits", async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    const { title, weekDays } = createHabitBody.parse(request.body);

    const today = dayjs().startOf("day").toDate();

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map((weekDay) => {
            return {
              week_day: weekDay,
            };
          }),
        },
      },
    });
  });

  // Route to date specific
  app.get("/day", async (request) => {
    const getDay = z.object({
      date: z.coerce.date(),
    });

    const { date } = getDay.parse(request.query);
    // localhost:3000/day?date=2022-01-13T00

    const parseDate = dayjs(date).startOf("day");
    const weekDay = parseDate.get("day");

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          },
        },
      },
    });

    const day = await prisma.day.findUnique({
      where: {
        date: parseDate.toDate(),
      },
      include: {
        dayHabits: true,
      },
    });

    const completedHabits = day?.dayHabits.map((dayHabit) => {
      return dayHabit.habit_id;
    });

    return { possibleHabits, completedHabits };
  });
}
