package com.CDCBank.bancoDigital.controllers;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody; 
import org.springframework.web.bind.annotation.RestController;

import com.CDCBank.bancoDigital.dto.request.PatchUserDTO;
import com.CDCBank.bancoDigital.dto.request.UsuarioCreateDTO;
import com.CDCBank.bancoDigital.dto.response.UsuarioCreateResponseDTO;
import com.CDCBank.bancoDigital.dto.response.UsuarioResponseDTO;
import com.CDCBank.bancoDigital.mappers.UsuarioMapper;
import com.CDCBank.bancoDigital.models.Usuario;
import com.CDCBank.bancoDigital.service.UsuarioService;
import io.swagger.v3.oas.annotations.Parameter;
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
        UsuarioCreateResponseDTO response = usuarioMapper.toCreateResponseDTO(usuario);
        
        log.info("Usuário criado com sucesso - ID: {} | Email: {}", 
            usuario.getId(), usuario.getEmail());
            
        return ResponseEntity.status(201).body(response);
    }

    @Operation(summary = "Excluir usuário", 
               description = "Remove um usuário do sistema de forma permanente ")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Usuário excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
            @ApiResponse(responseCode = "403", description = "Sem permissão para excluir usuários"),
            @ApiResponse(responseCode = "400", description = "Usuário possui registros vinculados"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @Parameter(description = "ID do usuário", required = true, example = "1")
            @PathVariable Long id) {
        
        log.info("Excluindo usuário ID: {}", id);

        usuarioService.deleteById(id);
        
        log.info("Usuário ID: {} excluído com sucesso", id);
        
        return ResponseEntity.noContent().build();
    }

     @Operation(summary = "Listar todos os usuários", 
               description = "Retorna lista completa de usuários cadastrados (apenas para administradores)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "403", description = "Sem permissão para listar usuários")
    })
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos(
            @Parameter(description = "Número da página", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamanho da página", example = "10")
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Listando todos os usuários - Página: {} | Tamanho: {}", page, size);

        List<Usuario> usuarios = usuarioService.findAll();
        List<UsuarioResponseDTO> response = usuarios.stream()
                .map(usuarioMapper::toResponseDTO)
                .collect(Collectors.toList());
        
        log.info("Total de usuários listados: {}", response.size());
        
        return ResponseEntity.ok(response);
    }

     @Operation(summary = "Atualizar campos especificos", description = "Atualiza apenas os campos especificados usando PATCH. "
            +
            "Permite atualizar um ou múltiplos campos de uma só vez. " +
            "Validações automáticas são aplicadas a cada campo.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Map com as configurações a serem atualizadas", required = true, content = @Content(mediaType = "application/json", examples = {
                    @ExampleObject(name = "Atualizar apenas o nome", value = """
                            {
                            "id":1,  
                            "nome":"Joao Paulo"
                            }
                            """),
                    @ExampleObject(name = "Atualizar varios campos", value = """
                            {
                               "id":1,  
                            "nome":"Joao Paulo",
                              "rendamensal":10000
                              "datanascimento":"2004-01-01"
                            }
                            """)
            })))

    @PatchMapping
    public ResponseEntity<PatchUserDTO> atualizarinformacoes(@RequestBody PatchUserDTO informacoes) {
        log.info("Atualizando informações específicas: {}", informacoes.toString());

        try {
            Usuario usuarioAtualizado = usuarioService.atualizarCampos(informacoes);

            log.info("Campos atualizados com sucesso");

            return ResponseEntity.ok(usuarioMapper.toPatchResponseDTO(usuarioAtualizado));

        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao atualizar : {}", e.getMessage());
            throw e;

        } catch (Exception e) {
            log.error("Erro inesperado ao atualizar : {}", e.getMessage(), e);
            throw new RuntimeException("Erro interno ao atualizar ", e);
        }
    }

     @Operation(summary = "Buscar usuário por ID", 
               description = "Retorna um usuário específico através do seu ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário encontrado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
            @ApiResponse(responseCode = "403", description = "Sem permissão para buscar usuário"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(
            @Parameter(description = "ID do usuário", required = true, example = "1")
            @PathVariable Long id) {
        
        log.info("Buscando usuário por ID: {}", id);

        Usuario usuario = usuarioService.findById(id);
        UsuarioResponseDTO response = usuarioMapper.toResponseDTO(usuario);
        
        log.info("Usuário encontrado - ID: {} | Email: {}", usuario.getId(), usuario.getEmail());
        
        return ResponseEntity.ok(response);
    }

}