import { prisma } from "../database/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "../services/emailService";
import { client } from "../mqtt/client";

//faz o login no sistema


export async function handleLogin(message: string) {
  const { requestId, email, senha } = JSON.parse(message);
  const jwtKey = process.env.JWT!;  

  console.log(`🔍 Login recebido: ${email}, reqId: ${requestId}`);

  //verifica se existe um usuario com o email enviado
  const findUser = await prisma.users.findUnique({
    where: { email },
  });

  if (!findUser) {
    const response = "Usuario nao encontrado";
    client.publish(`user/loginResponse/${requestId}`, response);
    return;
  }

  const hash = findUser.password; //salva a senha criptografada em uma variavel para poder ser comparada
  const token = jwt.sign(email, jwtKey); //gera um token jwt para validar o login depois
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`; //gera o coigo otp 

  bcrypt.compare(senha, hash, async (err, result) => {

    console.log("Senha recebida:", senha);
    console.log("Hash no banco:", hash);
    console.log("Resultado da comparação:", result);

    //compara a senha criptografada com a enviada

    //caso a comparação seja bem sucedida, envia o email de confirmação
    if (result) {
      await prisma.users.update({
        where: { email },
        data: { token, verified: false, otp,  },
      });

      sendEmail({
        to: email,
        subject: "Código de verificação - EcoWaste",
        text: otp,
      });

      const response = {
        verified: true,
        token,
        username: findUser.name,
        loggedEmail: findUser.email,
        message: `Email de verificação enviado para: ${email}`,
      };

      client.publish(
        `user/loginResponse/${requestId}`,
        JSON.stringify(response)
      );
    } else {
      const response = { verified: false };
      client.publish(
        `user/loginResponse/${requestId}`,
        JSON.stringify(response)
      );
    }
  });
}