package com.CDCBank.bancoDigital.dto.response;

import java.util.Date;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UsuarioLoginDTO {
   private Long id;
   private String nome;
   private String email;
   private Float rendaMensal;
   private Float saldo;
   private Date dataNascimento;
   private String idFiscal;
}