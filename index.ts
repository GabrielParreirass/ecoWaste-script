import mqtt from "mqtt";
import { handleLogin } from "./routes/Login";
import { confirmOtpLogin } from "./routes/confirmOtpLogin";
import { handleCadastro } from "./routes/Cadastro";
import { agendarColeta } from "./routes/AgendarColeta";
import { handleGetColetas } from "./routes/GetColetas";
import { handleGetUserData } from "./routes/GetUserData";
import { handleAddCupon } from "./routes/Cupon";
import { handleEditProfile } from "./routes/EditProfile";
import { handleManutencao } from "./routes/Manutencao";
import { handlePaymentWithKey } from "./routes/Payments/PaymentWithKey";
import { handleSendPaymentKey } from "./routes/Payments/SendPaymentKey";
import { handleGetPaymentKeys } from "./routes/Payments/GetPaymentKeys";
import { handleFetchPaymentData } from "./routes/Payments/FetchPaymentData";
import { handlePayment } from "./routes/Payments/Payments";
import { verificateOtp } from "./routes/verificateOtp";
import { handleGetAllColetas } from "./routes/GetAllColetas";
import { handleReservarColeta } from "./routes/ReservarColeta";
import { handleCadastrarColetaLixeira } from "./routes/Lixeira/CadastrarColetaLixeira";
import { handleGetColetasReservadas } from "./routes/Coletas/ColetasReservadas";

const options = {
  clientId: "backend_" + Math.random().toString(16).substr(2, 8),

  username: "csilab", // corrigido aqui
  password: "WhoAmI#2024", // corrigido aqui
};

const client = mqtt.connect("mqtt://192.168.66.11:1883", options);

client.on("connect", () => {
  console.log("Conectado ao broker MQTT");

  client.subscribe("user/login", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/login");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/loginResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/loginResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/confirmOtp", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/confirmOtp");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/confirmOtpResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/confirmOtpResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/verificateOtp", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/verificateOtp");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/verificateOtpResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/verificateOtpResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/cadastro", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/cadastro");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/cadastroResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/cadastroResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/agendarColeta", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/agendarColeta");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/agendarColetaResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/agendarColetaResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/reservarColeta", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/reservarColeta");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/reservarColetaResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/reservarColetaResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/getColetas", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/getColetas");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/getAllColetas", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/getColetas");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/getColetasResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/getColetasResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/getUserData", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/getUserData");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/getUserDataResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/getUserDataResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/addCupon", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/addCupon");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/addCuponResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/addCuponResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/editProfile", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/editProfile");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/editProfileResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/editProfileResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/manutencao", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/manutencao");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/manutencaoResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/manutencaoResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/payment", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/payment");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/paymentResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/paymentResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/paymentWithKey", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/paymentWithKey");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/paymentWithKeyResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/paymentWithKeyResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/sendPaymentKey", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/sendPaymentKey");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/sendPaymentKeyResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/sendPaymentKeyResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/getPaymentKeys", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/getPaymentKeys");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/getPaymentKeysResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/getPaymentKeysResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/fetchPaymentData", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/fetchPaymentData");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });
  client.subscribe("user/fetchPaymentDataResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/fetchPaymentDataResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("EcoWaste/ultrassom", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico EcoWaste/ultrassom");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });
  client.subscribe("EcoWaste/ultrassomResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico EcoWaste/ultrassomResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

  client.subscribe("user/getColetasReservadas", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/getColetasReservadas");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });
  client.subscribe("user/getColetasReservadasResponse/#", (err) => {
    if (!err) {
      console.log("📡 Inscrito no tópico user/getColetasReservadasResponse/#");
    } else {
      console.error("Erro ao se inscrever:", err);
    }
  });

});

client.on("close", () => {
  console.log("❌ Backend desconectado do broker MQTT");
});

client.on("error", (err) => {
  console.error("❌ Erro no cliente MQTT do backend:", err);
});

client.on("message", async (topic, message) => {
  console.log(`📨 Mensagem recebida no tópico ${topic}: ${message.toString()}`);

  if (topic == "user/login") {
    handleLogin(message.toString());
  }

  if (topic == "user/verificateOtp") {
    verificateOtp(message.toString());
  }

  if (topic == "user/confirmOtp") {
    confirmOtpLogin(message.toString());
  }

  if (topic == "user/cadastro") {
    handleCadastro(message.toString());
  }

  if (topic == "user/agendarColeta") {
    agendarColeta(message.toString());
  }

  if (topic == "user/getColetas") {
    handleGetColetas(message.toString());
  }
  if (topic == "user/getAllColetas") {
    handleGetAllColetas(message.toString());
  }

  if (topic == "user/reservarColeta") {
    handleReservarColeta(message.toString())
  }

  if (topic == "user/getUserData") {
    handleGetUserData(message.toString());
  }

  if (topic == "user/addCupon") {
    handleAddCupon(message.toString());
  }

  if (topic == "user/editProfile") {
    handleEditProfile(message.toString());
  }

  if (topic == "user/manutencao") {
    handleManutencao(message.toString());
  }

  if (topic == "user/payment") {
    handlePayment(message.toString());
  }

  if (topic == "user/paymentWithKey") {
    handlePaymentWithKey(message.toString());
  }

  if (topic == "user/sendPaymentKey") {
    handleSendPaymentKey(message.toString());
  }

  if (topic == "user/getPaymentKeys") {
    handleGetPaymentKeys(message.toString());
  }

  if (topic == "user/fetchPaymentData") {
    handleFetchPaymentData(message.toString());
  }

  if(topic == "EcoWaste/ultrassom"){
    handleCadastrarColetaLixeira(message.toString())
  }

  if(topic == "user/getColetasReservadas"){
    handleGetColetasReservadas(message.toString())
  }
});
