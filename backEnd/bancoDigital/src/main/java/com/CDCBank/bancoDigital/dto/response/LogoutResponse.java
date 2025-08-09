package com.CDCBank.bancoDigital.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LogoutResponse {
     private String message;
    private boolean success;
}

