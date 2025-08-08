package com.CDCBank.bancoDigital.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody; 
import org.springframework.web.bind.annotation.RestController;

import com.CDCBank.bancoDigital.dto.request.UsuarioCreateDTO;
import com.CDCBank.bancoDigital.dto.response.UsuarioCreateResponseDTO;
import com.CDCBank.bancoDigital.mappers.UsuarioMapper;
import com.CDCBank.bancoDigital.models.Usuario;
import com.CDCBank.bancoDigital.service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Usuários", description = "Gerenciamento de usuários do sistema")
@SecurityRequirement(name = "bearer-key")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final UsuarioMapper usuarioMapper;
    
    @Operation(summary = "Criar novo usuario", 
               description = "Cria um novo usuario",
               requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                   description = "Dados do novo usuário",
                   required = true,
                   content = @Content(
                       mediaType = "application/json",
                       examples = @ExampleObject(
                           name = "Exemplo de criação de usuário",
                           value = """
                           {
                             "nome": "Mark",
                             "email": "mark@email.com",
                             "senha": "galo123",
                             "idFiscal": "12345678900",
                             "dataNascimento": "1990-01-01",
                             "rendaMensal": 3000.0
                           }
                           """
                       )
                   )
               ))
     @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "409", description = "Email já existe no sistema"),
            @ApiResponse(responseCode = "403", description = "Sem permissão para criar usuários"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @PostMapping("/usuario")
    public ResponseEntity<UsuarioCreateResponseDTO> criarUsuario(
            @Valid @RequestBody UsuarioCreateDTO usuarioCreateDTO) {
            
        log.info("Iniciando criação de usuário: {}", usuarioCreateDTO.getNome());
        log.debug("Dados recebidos: nome={}, email={}, idFiscal={}", 
            usuarioCreateDTO.getNome(), 
            usuarioCreateDTO.getEmail(), 
            usuarioCreateDTO.getIdFiscal());
        
        // Validação adicional para senha null
        if (usuarioCreateDTO.getSenha() == null || usuarioCreateDTO.getSenha().trim().isEmpty()) {
            throw new IllegalArgumentException("Senha não pode ser nula ou vazia");
        }
            
        Usuario usuario = usuarioService.create(usuarioCreateDTO);
        UsuarioCreateResponseDTO response = usuarioMapper.toResponseDTO(usuario);
        
        log.info("Usuário criado com sucesso - ID: {} | Email: {}", 
            usuario.getId(), usuario.getEmail());
            
        return ResponseEntity.status(201).body(response);
    }
}