import { prisma } from "../database/prisma";
import { client } from "../mqtt/client";

//chamado para confirmar o otp

export async function confirmOtpLogin(message: string) {
  const { email, otpValue, requestId } = JSON.parse(message);

  //acha o usuario desejado a parir do email enviado
  const user = await prisma.users.findFirst({
    where: {
      email,
    },
    include: { coletas: true },
  });

  //pega o codigo otp salvo no perfil do usuario e compara com o enviado
  if (user) {
    if (user.otp == otpValue) {
      await prisma.users.update({
        where: {
          email: user.email,
        },
        data: {
          verified: true,
        },
      });
      //se os codigos baterem, ele verifica o usuario e retorna true
      const response = {
        otpVerified: true,
        message: "Código verificado com sucesso!",
        token: user.token,
        username: user.name,
        coletas: user.coletas,
        role: user.role
      };
      client.publish(
        `user/confirmOtpResponse/${requestId}`,
        JSON.stringify(response)
      );
    } else {
      console.log("Falha ao verificar o código inserido");
      console.log(otpValue);
      const response = {
        otpVerified: false,
        message: "Código inserido é invalido",
      };
      client.publish(
        `user/confirmOtpResponse/${requestId}`,
        JSON.stringify(response)
      );
    }
    
  } else {
    const response = {
      otpVerified: false,
      message: "Falha ao localizar usuario",
    };
    client.publish(
        `user/confirmOtpResponse/${requestId}`,
        JSON.stringify(response)
      );
  }
}
