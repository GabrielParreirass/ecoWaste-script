import { prisma } from "../../database/prisma";
import { client } from "../../mqtt/client";

//trata toda a logica de pagamento

export async function handlePayment(message: string) {
  const { loggedEmail, emailDestinatario, valorPagamento, requestId } =
    JSON.parse(message);

  parseFloat(valorPagamento);

  //primeiramente, trata todas as situações onde o pagamento seria invalido

  //se nao houver todos os dados completos
  if (!loggedEmail || !emailDestinatario || !valorPagamento) {
    const response = { message: "Dados inválidos ou incompletos!" };
    client.publish(
      `user/paymentResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }

  //se o email do destinatario for igual ao de quem está enviando
  if (emailDestinatario == loggedEmail) {
    const response = {
      message: "Email nao pode ser igual ao do usuario logado",
    };
    client.publish(
      `user/paymentResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }

  //se o valor de pagamento for menor que 0 ou não for um número
  if (isNaN(valorPagamento) || valorPagamento <= 0) {
    const response = { message: "Valor de pagamento invalido" };
    client.publish(
      `user/paymentResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }

  //acha o perfil do remenete atraves do email passado na publicação
  const remetente = await prisma.users.findUnique({
    where: { email: loggedEmail },
  });


  //verifica se o saldo do remetente é menor do que o valor que ele deseja enviar
  if (remetente!.ecoCoins < valorPagamento) { 
    const response = { message: "Saldo insuficiente" };
    client.publish(
      `user/paymentResponse/${requestId}`,
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
    const response = { message: "Destinatario nao encontrado" };
    client.publish(
      `user/paymentResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }

  //depois de todos os casos de erro tratados, ele realiza a transação.
  try {
    //debita de uma conta e adiciona na outra
    await prisma.$transaction([
      prisma.users.update({
        where: { email: loggedEmail },
        data: { ecoCoins: { decrement: valorPagamento } },
      }),
      prisma.users.update({
        where: { email: emailDestinatario },
        data: { ecoCoins: { increment: valorPagamento } },
      }),
    ]);

    //cria uma transação de pagamento para rastreamentos futuros
    await prisma.transacoes.create({
      data: {
        type: "Pagamento",
        value: valorPagamento.toString(),
        partner: emailDestinatario,
        usersId: remetente!.id,
      },
    });

    //cria uma transação de recebimento para rastreamentos futuros
    await prisma.transacoes.create({
      data: {
        type: "Recebimento",
        value: valorPagamento.toString(),
        partner: loggedEmail,
        usersId: destinatario.id,
      },
    });

    //retorna a resposta em caso de sucesso/fracasso
    const response = { message: "Operação concluida com sucesso" };
    client.publish(
      `user/paymentResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  } catch (error) {
    console.error(error);
    const response = { message: "Erro ao executar a transação" };
    client.publish(
      `user/paymentResponse/${requestId}`,
      JSON.stringify(response)
    );
    return;
  }
}
