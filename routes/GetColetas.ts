import { prisma } from "../database/prisma";
import { client } from "../mqtt/client";

//retorna todas as coletas de um usuario em especifico

export async function handleGetColetas(message: string) {
  const { email, requestId } = JSON.parse(message);
  const user = await prisma.users.findFirst({
    where: {
      email,
    },
  });

  const coletas = await prisma.coletas.findMany({
    where: {
      usersId: user!.id,
    },
  });

  const response = { coletas: coletas };

  client.publish(
    `user/getColetasResponse/${requestId}`,
    JSON.stringify(response)
  );
}
