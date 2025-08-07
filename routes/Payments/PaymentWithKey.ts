import { prisma } from "../../database/prisma";
import { client } from "../../mqtt/client";

//trata os pagamentos atraves de chave de pagamento

export async function handlePaymentWithKey(message:string) {
    const { loggedEmail, emailDestinatario, valorPagamento, idKey, requestId} = JSON.parse(message)

    parseFloat(valorPagamento)

    console.log(loggedEmail, emailDestinatario, valorPagamento)

    //trata todos os casos onde o pagamento seria invalido

    //verifica se todos os campos foram preenchidos
    if (!loggedEmail || !emailDestinatario || !valorPagamento) {
    const response = { message: "Dados inválidos ou incompletos!" };
    client.publish(
      `user/paymentWithKeyResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }

  //verifica se o destinatario nao é igual ao remetente
  if (emailDestinatario == loggedEmail) {
    const response = { message: "Email nao pode ser igual ao do usuario logado" };
    client.publish(
      `user/paymentWithKeyResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }

  //verifica se o valor de pagamento é maior que 0 e é um numero
  if (isNaN(valorPagamento) || valorPagamento <= 0) {
    const response = { message: "Valor de pagamento inválido!" };
    client.publish(
      `user/paymentWithKeyResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }

  //acha o perfil do remenete atraves do email passado na publicação
  const remetente = await prisma.users.findUnique({
    where: { email: loggedEmail },
    select: { ecoCoins: true, chavesPendentes: true, id: true },
  });

  //verifica se o saldo do remetente é menor do que o valor que ele deseja enviar
  if (remetente!.ecoCoins < valorPagamento) {
    const response = { message: "Saldo insuficiente!" };
    client.publish(
      `user/paymentWithKeyResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }

  //acha o perfil do destinatario atraves do email passado na publicação
  const destinatario = await prisma.users.findUnique({
    where: { email: emailDestinatario },
  });

  //se o destinatario nao existir/nao for encontrado
  if (!destinatario) {
    const response = { message: "Destinatário não encontrado!" };
    client.publish(
      `user/paymentWithKeyResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }

  //erro no parse das chaves
  if (!Array.isArray(remetente!.chavesPendentes)) {
    const response = { message: "Erro: chavesPendentes não é um array!" };
    client.publish(
      `user/paymentWithKeyResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }

  //atualiza a lista de chaves pendentes do rementente, removendo a que ele pagar
  const chavesAtualizadas = remetente!.chavesPendentes.filter(
    (chave: any) => chave.id !== idKey
  );

  //realiza a transação
  try {
    //debita o valor do remetente e adiciona no destinatario
    await prisma.$transaction([
      prisma.users.update({
        where: { email: loggedEmail },
        data: {
          ecoCoins: { decrement: valorPagamento },
          chavesPendentes: chavesAtualizadas,
        },
      }),
      prisma.users.update({
        where: { email: emailDestinatario },
        data: { ecoCoins: { increment: valorPagamento } },
      }),
    ]);

    //cria uma transação de pagamento para rastramentos futuros
    await prisma.transacoes.create({
      data: {
        type: "Pagamento",
        value: valorPagamento.toString(),
        partner: emailDestinatario,
        usersId: remetente!.id,
      },
    });

    //cria uma transação de recebimento para rastramentos futuros
    await prisma.transacoes.create({
      data: {
        type: "Recebimento",
        value: valorPagamento.toString(),
        partner: loggedEmail,
        usersId: destinatario.id,
      },
    });

    //publica a resposta em caso de sucesso/fracasso
    const response = { message: "Operação concluída com sucesso!" };
    client.publish(
      `user/paymentWithKeyResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  } catch (error) {
    console.error(error);
    const response = { message: "Erro ao executar a transação!" };
    client.publish(
      `user/paymentWithKeyResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }


}