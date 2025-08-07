import { prisma } from "../database/prisma";
import { client } from "../mqtt/client";

//retorna todas as coletas de todos os usuarios

export async function handleGetAllColetas(message: string) {
  const { email, requestId } = JSON.parse(message);
  const coletas = await prisma.coletas.findMany({});

  const response = { coletas: coletas };

  client.publish(
    `user/getAllColetasResponse/${requestId}`,
    JSON.stringify(response)
  );
}
