import { prisma } from "../database/prisma";
import { client } from "../mqtt/client";

export async function verificateOtp(message: string) {
  const { email, otp, requestId } = JSON.parse(message);
  const targetEmail = email;
  const otpSend = otp;

  const user = await prisma.users.findFirst({
    where: {
      email: targetEmail,
    },
  });

  if (user) {
    if (user.otp == otpSend) {
      await prisma.users.update({
        where: {
          email: targetEmail,
        },
        data: {
          verified: true,
        },
      });
      const response = {
        otpVerified: true,
        message: "Código verificado com sucesso!",
      };
      client.publish(
        `user/verificateOtpResponse/${requestId}`,
        JSON.stringify(response)
      );
    } else {
      const response = {
        otpVerified: false,
        message: "Código inserido é invalido",
      };
      client.publish(
        `user/verificateOtpResponse/${requestId}`,
        JSON.stringify(response)
      );
    }
  } else {
    const response = {
        otpVerified: false,
        message: "Falha ao localizar usuario",
      };
      client.publish(
        `user/verificateOtpResponse/${requestId}`,
        JSON.stringify(response)
      );
  }
}
