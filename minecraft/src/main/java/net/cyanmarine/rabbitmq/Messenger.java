package net.cyanmarine.rabbitmq;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DeliverCallback;
import net.minecraft.network.message.MessageType;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.text.Text;

import static net.cyanmarine.rabbitmq.Rabbitmq.LOGGER;
import static net.cyanmarine.rabbitmq.Rabbitmq.server;


public class Messenger {
    private static final String EXCHANGE_NAME = "topic_logs";

    private static void message(String str) {
        LOGGER.info("Received " + str);
        if (server != null) server.getPlayerManager().broadcast(Text.of(str), false);
    }

    public static void send(String message, String routingKey) {
        try {
            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost("localhost");
            try (Connection connection = factory.newConnection();
                 Channel channel = connection.createChannel()) {

                channel.exchangeDeclare(EXCHANGE_NAME, "topic");

                channel.basicPublish(EXCHANGE_NAME, routingKey, null, message.getBytes("UTF-8"));
                LOGGER.info(" [x] Sent '" + routingKey + "':'" + message + "'");
            }
        } catch (Exception err) {
            LOGGER.error( (" [x] Error: " + err.getMessage()));
        }
    }

    public static void receive(String[] argv) {
        try {
            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost("localhost");
            Connection connection = factory.newConnection();
            Channel channel = connection.createChannel();

            channel.exchangeDeclare(EXCHANGE_NAME, "topic");
            String queueName = channel.queueDeclare().getQueue();

            if (argv.length < 1) {
                System.err.println("Usage: ReceiveLogsTopic [binding_key]...");
                System.exit(1);
            }

            for (String bindingKey : argv) {
                channel.queueBind(queueName, EXCHANGE_NAME, bindingKey);
            }

            System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                JsonObject data = new Gson().fromJson(new String(delivery.getBody(), "UTF-8"), JsonObject.class);
                String message = "[" + data.get("player").getAsString() + "] " + data.get("content").getAsString();
                System.out.println(" [x] Received '" + delivery.getEnvelope().getRoutingKey() + "':'" + message + "'");
                message(message);
            };
            channel.basicConsume(queueName, true, deliverCallback, consumerTag -> { });
        } catch (Exception err) {
            LOGGER.error(" [x] Error: " + err.getMessage());
        }
    }

}
