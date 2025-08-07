import { prisma } from "../database/prisma";
import { client } from "../mqtt/client";

//adiciona um pedido de manutenção

export async function handleManutencao(message: string) {
  const { userEmail, type, requestId } = JSON.parse(message);
  const user = await prisma.users.update({
    where: {
      email: userEmail,
    },
    data: {
      manutencoes: {
        create: {
          type,
        },
      },
    },
  });

  if (user) {
    const response = { message: "Chamado criado com sucesso" };
    client.publish(
      `user/manutencaoResponse/${requestId}`,
      JSON.stringify(response)
    );
  } else {
    const response = { message: "Falha ao criar chamado" };
    client.publish(
      `user/manutencaoResponse/${requestId}`,
      JSON.stringify(response)
    );
  }
}
