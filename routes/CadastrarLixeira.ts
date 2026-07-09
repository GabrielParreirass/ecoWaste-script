import { prisma } from "../database/prisma";
import { client } from "../mqtt/client";

//cadastra uma lixeira para um usuario
export async function handleCadastrarLixeira(message: string) {
  const { email, lixeiraId, requestId } = JSON.parse(message);

  const lixeira = await prisma.lixeiras.findUnique({
    where: { id: lixeiraId },
  });

  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (lixeira) {
    const cadastro = await prisma.users.update({
      where: {
        email,
      },
      data: {
        temLixeira: true,
        Lixeiras: {
          connect: {
            id: lixeiraId,
          },
        },
      },
    });
    

    if (cadastro) {
      const response = { message: "Lixeira cadastrada com sucesso" };
      client.publish(
        `user/cadastrarLixeiraResponse/${requestId}`,
        JSON.stringify(response),
      );
      return;
    }
  } else {
    const response = { error: "Lixeira não encontrada" };
    client.publish(
      `user/cadastrarLixeiraResponse/${requestId}`,
      JSON.stringify(response),
    );
    return;
  }
}