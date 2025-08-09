package com.CDCBank.bancoDigital.controllers;


import com.CDCBank.bancoDigital.dto.error.ErrorResponseDTO;
import com.CDCBank.bancoDigital.dto.request.TransacaoRequestDTO;
import com.CDCBank.bancoDigital.dto.response.HistoricoTransacaoDTO;
import com.CDCBank.bancoDigital.dto.response.TransacaoResponseDTO;
import com.CDCBank.bancoDigital.models.Usuario;
import com.CDCBank.bancoDigital.service.TransacaoService;
import com.CDCBank.bancoDigital.service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transacoes")
@RequiredArgsConstructor
@Tag(name = "Transações", description = "Operações relacionadas a transações bancárias")
@SecurityRequirement(name = "bearerAuth")
public class TransacaoController {
    
    private final TransacaoService transacaoService;
    private final UsuarioService usuarioService;

    @PostMapping("/realizar")
    @Operation(
        summary = "Realizar uma transação",
        description = "Realiza uma transação bancária (transferência, depósito, saque, etc.) do usuário autenticado"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Transação realizada com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = TransacaoResponseDTO.class),
                examples = @ExampleObject(
                    name = "Transação realizada com sucesso",
                    value = """
                    {
                        "id": 1,
                        "dataTransacao": "2025-08-09T14:30:00",
                        "valor": 100.50,
                        "descricao": "Pagamento de serviços",
                        "remetente": {
                            "id": 1,
                            "nome": "João Silva",
                            "email": "joao@email.com"
                        },
                        "destinatario": {
                            "id": 2,
                            "nome": "Maria Santos",
                            "email": "maria@email.com"
                        }
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Erro na validação dos dados ou regra de negócio",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponseDTO.class),
                examples = {
                    @ExampleObject(
                        name = "Saldo insuficiente",
                        value = """
                        {
                            "codigo": "ERRO_TRANSACAO",
                            "mensagem": "Saldo insuficiente para realizar a transação"
                        }
                        """
                    ),
                    @ExampleObject(
                        name = "Conta destino inválida",
                        value = """
                        {
                            "codigo": "ERRO_TRANSACAO",
                            "mensagem": "Conta destino não encontrada"
                        }
                        """
                    )
                }
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Erro interno do servidor",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponseDTO.class),
                examples = @ExampleObject(
                    name = "Erro interno",
                    value = """
                    {
                        "codigo": "ERRO_INTERNO",
                        "mensagem": "Erro interno do servidor"
                    }
                    """
                )
            )
        )
    })
    public ResponseEntity<?> realizarTransacao(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Dados da transação a ser realizada",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = TransacaoRequestDTO.class),
                examples = {
                    @ExampleObject(
                        name = "Transação para outro usuário",
                        summary = "Exemplo de transação entre usuários",
                        value = """
                        {
                            "idDestinatario": 2,
                            "valor": 100.50,
                            "descricao": "Pagamento de serviços"
                        }
                        """
                    ),
                    @ExampleObject(
                        name = "Transferência maior valor",
                        summary = "Exemplo de transferência de valor maior",
                        value = """
                        {
                            "idDestinatario": 5,
                            "valor": 1500.00,
                            "descricao": "Pagamento de aluguel"
                        }
                        """
                    ),
                    @ExampleObject(
                        name = "Pagamento simples",
                        summary = "Exemplo de pagamento simples",
                        value = """
                        {
                            "idDestinatario": 3,
                            "valor": 50.00,
                            "descricao": "Divisão da conta do restaurante"
                        }
                        """
                    )
                }
            )
        )
        @Valid @RequestBody TransacaoRequestDTO request) {
        try {
            // Obter ID do usuário autenticado
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            
            // Aqui você precisaria de um método para buscar usuário por email
            // Por simplicidade, assumindo que você tem acesso ao ID do usuário logado
            Long idRemetente = obterIdUsuarioLogado(email);
            
            TransacaoResponseDTO response = transacaoService.realizarTransacao(idRemetente, request);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponseDTO("ERRO_TRANSACAO", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("ERRO_INTERNO", "Erro interno do servidor"));
        }
    }
    
    @GetMapping("/historico")
    @Operation(
        summary = "Obter histórico de transações",
        description = "Retorna o histórico paginado de transações do usuário autenticado"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Histórico de transações obtido com sucesso",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "Histórico de transações",
                    value = """
                    {
                        "content": [
                            {
                                "id": 1,
                                "dataTransacao": "2025-08-09T14:30:00",
                                "valor": 100.50,
                                "descricao": "Pagamento de serviços",
                                "tipoTransacao": "ENVIADA",
                                "outroUsuario": {
                                    "id": 2,
                                    "nome": "Maria Santos",
                                    "email": "maria@email.com"
                                }
                            },
                            {
                                "id": 2,
                                "dataTransacao": "2025-08-08T10:15:00",
                                "valor": 250.00,
                                "descricao": "Recebimento de aluguel",
                                "tipoTransacao": "RECEBIDA",
                                "outroUsuario": {
                                    "id": 3,
                                    "nome": "Pedro Oliveira",
                                    "email": "pedro@email.com"
                                }
                            },
                            {
                                "id": 3,
                                "dataTransacao": "2025-08-07T16:45:00",
                                "valor": 75.00,
                                "descricao": "Divisão da conta",
                                "tipoTransacao": "ENVIADA",
                                "outroUsuario": {
                                    "id": 4,
                                    "nome": "Ana Costa",
                                    "email": "ana@email.com"
                                }
                            }
                        ],
                        "totalElements": 15,
                        "totalPages": 2,
                        "number": 0,
                        "size": 10
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Erro na validação dos parâmetros",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponseDTO.class),
                examples = @ExampleObject(
                    name = "Parâmetros inválidos",
                    value = """
                    {
                        "codigo": "ERRO_HISTORICO",
                        "mensagem": "Parâmetros de paginação inválidos"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Erro interno do servidor",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponseDTO.class),
                examples = @ExampleObject(
                    name = "Erro interno",
                    value = """
                    {
                        "codigo": "ERRO_INTERNO",
                        "mensagem": "Erro interno do servidor"
                    }
                    """
                )
            )
        )
    })
    public ResponseEntity<?> obterHistoricoTransacoes(
            @Parameter(
                description = "Número da página (inicia em 0)",
                example = "0"
            )
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(
                description = "Quantidade de itens por página",
                example = "10"
            )
            @RequestParam(defaultValue = "10") int size) {
        try {
            // Obter ID do usuário autenticado
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            Long idUsuario = obterIdUsuarioLogado(email);
            
            Page<HistoricoTransacaoDTO> historico = transacaoService.obterHistoricoTransacoes(idUsuario, page, size);
            return ResponseEntity.ok(historico);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponseDTO("ERRO_HISTORICO", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("ERRO_INTERNO", "Erro interno do servidor"));
        }
    }
    
    // Método auxiliar - você deve implementar baseado no seu UsuarioService
    private Long obterIdUsuarioLogado(String email) {
        Usuario usuario = usuarioService.findByUsername(email);
        if (usuario == null) {
            throw new RuntimeException("Usuário não encontrado");
        }
        return usuario.getId();
    }
}