import { prisma } from "../database/prisma";
import { client } from "../mqtt/client";
import bcrypt from "bcrypt";
import { sendEmail } from "../services/emailService";

//realiza o cadastro de um novo usuario

export async function handleCadastro(message: string) {
  const saltRounds = 10; //salt para criptografar a senha

  const { email, name, password, role, requestId } = JSON.parse(message);

  //verifica se ja existe algum usario cadastrado com o email
  const findUser = await prisma.users.findFirst({
    where: {
      email: email,
    },
  });

  if (findUser) {
    console.log("email ja existe");
    const response = { create: false, message: "Email ja existente" };
    client.publish(
      `user/cadastroResponse/${requestId}`,
      JSON.stringify(response)
    );
  } else {
    //caso nao exista nenhum usuario ja cadastrado com o email desejado
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`; //gera o codigo de otp que vai ser enviado por email

    //criptografa a senha enviada e cria o usuario com todas as informações passadas
    bcrypt.hash(password, saltRounds, async function (err, hash) {
      const createUser = await prisma.users.create({
        data: {
          name,
          email,
          password: hash,
          verified: false,
          otp,
          ecoCoins: 0,
          role,
          temLixeira: true,
          Lixeiras:{
            create:{
              cheia:false,
              latitude:"-22.256755",
              longitude:"-45.696073",
              type:"Papel",
              
            }
          }
        },
      });


      //caso a criação do usuario for feita com sucesso, envia o email com o codigo de confirmação
      if (createUser) {
        sendEmail({
          to: email,
          subject: "Código de verificação - EcoWaste",
          text: otp,
        });
        const response = {
          createUser,
          message: `Email de verificação enviado para: ${email}`,
          create: true,
        };
        client.publish(
          `user/cadastroResponse/${requestId}`,
          JSON.stringify(response)
        );
      } else {
        const response = {
          message: "Falha ao criar usuario",
          create: false,
        };
        client.publish(
          `user/cadastroResponse/${requestId}`,
          JSON.stringify(response)
        );
      }
    });
  }
}
