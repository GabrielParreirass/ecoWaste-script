import { prisma } from "../../database/prisma";
import { client } from "../../mqtt/client";

//retorna todas as transações de um usuario em especifico

export async function handleFetchPaymentData(message: string) {
  const { email, requestId } = JSON.parse(message);

  
  const user = await prisma.users.findUnique({
    where: {
      email,
    },
    include: {
      transacoes: true,
    },
  });

  const response = {
    transacoes: user!.transacoes,
    saldoEcoCoins: user!.ecoCoins,
  };

  client.publish(
      `user/fetchPaymentDataResponse/${requestId}`,
      JSON.stringify(response)
    );
}
