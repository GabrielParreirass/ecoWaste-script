import { prisma } from "../../database/prisma";
import { client } from "../../mqtt/client";

//retorna todas as chaves de pagamento pendentes para aquele usuario

export async function handleGetPaymentKeys(message: string) {
  const { email, requestId } = JSON.parse(message);

  const user = await prisma.users.findUnique({
    where: {
      email,
    },
    select: {
      chavesPendentes: true,
    },
  });

  const response = { paymentKeys: user!.chavesPendentes };

  client.publish(
      `user/getPaymentKeysResponse/${requestId}`,
      JSON.stringify(response)
    );
}
