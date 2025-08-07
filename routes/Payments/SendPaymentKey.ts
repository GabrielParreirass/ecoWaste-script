import { prisma } from "../../database/prisma";
import { client } from "../../mqtt/client";

//envia chaves de pagamento

export async function handleSendPaymentKey(message:string) {
    const {devedor, valor, recebedor, requestId} = JSON.parse(message);
    const randomId = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    //verifica se todas as informações foram preenchidas

    if (!recebedor || !devedor || !valor) {
    const response = { message: "Dados inválidos ou incompletos!" };
    client.publish(
      `user/sendPaymentKeyReponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }

  //verifica se o rementede é igual ao destinatario

  if (devedor == recebedor) {
    const response = { message: "Email nao pode ser igual ao do usuario logado" };
    client.publish(
      `user/sendPaymentKeyResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }

  //verifica se o valor de pagamento é maior que 0 e é um numero

  if (isNaN(valor) || valor <= 0) {
    const response = { message: "Valor de pagamento inválido!" };
    client.publish(
      `user/sendPaymentKeyResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }


  //acha o perfil do destinatario atraves do email passado na publicação
  const user = await prisma.users.findUnique({
    where: {
      email: devedor,
    },
  });

  //transforma as chaves pendentes é um array
  const currentKeys = Array.isArray(user!.chavesPendentes)
    ? user!.chavesPendentes
    : [];

    //adiciona uma nova chave no array
  currentKeys.push({
    nomeChave: recebedor,
    valor: valor,
    recebedor: recebedor,
    id: randomId,
  });

  //atualiza as chaves no perfil do devedor
  try {
    await prisma.users.update({
      where: {
        email: devedor,
      },
      data: {
        chavesPendentes: currentKeys,
      },
    });
    const response = { message: "Chave enviada com sucesso!" };
    client.publish(
      `user/sendPaymentKeyResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  } catch (error) {
    console.error(error);
    const response = { message: "Usuario devedor nao econtrado!" };
    client.publish(
      `user/sendPaymentKeyResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }
}