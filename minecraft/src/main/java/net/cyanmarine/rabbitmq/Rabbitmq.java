package net.cyanmarine.rabbitmq;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents;
import net.fabricmc.fabric.api.message.v1.ServerMessageEvents;
import net.minecraft.client.util.ChatMessages;
import net.minecraft.server.MinecraftServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Objects;

public class Rabbitmq implements ModInitializer {
    public static String MOD_ID = "rabbitmq";
    public static Logger LOGGER = LoggerFactory.getLogger("rabbitmq");
    public static MinecraftServer server;

    @Override
    public void onInitialize() {
        LOGGER.info("Initializing " + MOD_ID);
        ServerLifecycleEvents.SERVER_STARTED.register(server -> {
            Rabbitmq.server = server;
            LOGGER.info("New server");
        });
        ServerLifecycleEvents.SERVER_STOPPING.register(server -> {
            Rabbitmq.server = null;
            LOGGER.info("Server stopping");
        });
        ServerMessageEvents.CHAT_MESSAGE.register((message, player, parameters) -> {
            if (server != null) {
                String content = (message.getSignedContent()).replace("\"", "\\\"");
                String playerName = player.getName().getLiteralString();
                if (playerName != null) playerName = playerName.replace("\"", "\\\"");
                LOGGER.info(playerName + " sent " + content);
                Messenger.send("{ \"player\": \"" + playerName + "\", \"content\": \"" + content + "\" }", "chat.from.minecraft");
            }
        });
        Messenger.receive(new String[]{ "chat.to.minecraft", "chat.to.all", "chat.from.discord" });
        LOGGER.info("Initialized " + MOD_ID);
    }
}
