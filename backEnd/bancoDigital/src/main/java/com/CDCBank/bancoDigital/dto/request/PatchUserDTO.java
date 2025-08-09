package com.CDCBank.bancoDigital.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class PatchUserDTO {
    
    @NotNull(message = "ID do usuário é obrigatório")
    @Positive(message = "ID deve ser um número positivo")
    private Long id;
    
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    private String nome;
    
    private Date dataNascimento;
    
    @PositiveOrZero(message = "Renda mensal deve ser zero ou um valor positivo")
    private Float rendaMensal; 
    
   
    public boolean temCamposParaAtualizar() {
        return nome != null || 
               dataNascimento != null || 
               rendaMensal != null;
    }
}