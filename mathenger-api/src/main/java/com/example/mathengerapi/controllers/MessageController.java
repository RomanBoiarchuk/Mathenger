package com.example.mathengerapi.controllers;

import com.example.mathengerapi.models.Chat;
import com.example.mathengerapi.models.User;
import com.example.mathengerapi.models.message.Message;
import com.example.mathengerapi.services.AuthenticationService;
import com.example.mathengerapi.services.MessageService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin
@AllArgsConstructor
public class MessageController {
    private MessageService messageService;
    private AuthenticationService authenticationService;

    @MessageMapping("chats/{chatId}/send")
    public void sendMessage(@Header(name = "Authorization") String token,
                            @Payload Message message, @DestinationVariable Long chatId) throws JsonProcessingException {
        messageService.sendMessage(authenticationService.getUserId(token.replace("Bearer ", "")), message, chatId);
    }

    @GetMapping("chats/{chat}/messages")
    public ResponseEntity<List<Message>> getOlderMessages(@PathVariable Chat chat, @AuthenticationPrincipal User user,
                                                          @RequestParam @DateTimeFormat(iso =
                                                                  DateTimeFormat.ISO.DATE_TIME) LocalDateTime time) {
        return new ResponseEntity<>(messageService.getOlderMessages(user.getId(), chat, time), HttpStatus.OK);
    }

    @PostMapping("chats/{chatId}/send")
    public void sendMessageByHttp(@RequestHeader(name = "Authorization") String token,
                            @RequestBody Message message, @PathVariable Long chatId) throws JsonProcessingException {
        messageService.sendMessage(authenticationService.getUserId(token.replace("Bearer ", "")), message, chatId);
    }

}
