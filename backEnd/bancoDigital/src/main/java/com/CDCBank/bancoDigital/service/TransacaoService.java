package com.CDCBank.bancoDigital.service;


import com.CDCBank.bancoDigital.dto.request.TransacaoRequestDTO;
import com.CDCBank.bancoDigital.dto.response.HistoricoTransacaoDTO;
import com.CDCBank.bancoDigital.dto.response.TransacaoResponseDTO;
import com.CDCBank.bancoDigital.dto.response.UsuarioResponseDTO;
import com.CDCBank.bancoDigital.models.Transacao;
import com.CDCBank.bancoDigital.models.Usuario;
import com.CDCBank.bancoDigital.repository.TransacaoRepository;
import com.CDCBank.bancoDigital.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransacaoService {
    
    private final TransacaoRepository transacaoRepository;
    private final UsuarioRepository usuarioRepository;
    
    @Transactional
    public TransacaoResponseDTO realizarTransacao(Long idRemetente, TransacaoRequestDTO request) {
        // Buscar usuários
        Usuario remetente = usuarioRepository.findById(idRemetente)
            .orElseThrow(() -> new RuntimeException("Usuário remetente não encontrado"));
        
        Usuario destinatario = usuarioRepository.findById(request.getIdDestinatario())
            .orElseThrow(() -> new RuntimeException("Usuário destinatário não encontrado"));
        
        // Validações
        if (remetente.getId().equals(destinatario.getId())) {
            throw new RuntimeException("Não é possível fazer transação para si mesmo");
        }
        
        BigDecimal saldoRemetente = BigDecimal.valueOf(remetente.getSaldo());
        if (saldoRemetente.compareTo(request.getValor()) < 0) {
            throw new RuntimeException("Saldo insuficiente do remetente para realizar a transação");
        }
        
      
        
      
        BigDecimal novoSaldoRemetente = saldoRemetente.subtract(request.getValor());
        BigDecimal saldoDestinatario = BigDecimal.valueOf(destinatario.getSaldo());
        BigDecimal novoSaldoDestinatario = saldoDestinatario.add(request.getValor());
        
        remetente.setSaldo(novoSaldoRemetente.floatValue());
        destinatario.setSaldo(novoSaldoDestinatario.floatValue());
        
        
        usuarioRepository.save(remetente);
        usuarioRepository.save(destinatario);
        
       
        Transacao transacao = Transacao.builder()
            .valor(request.getValor())
            .remetente(remetente)
            .destinatario(destinatario)
            .descricao(request.getDescricao())
            .build();
        
        transacao = transacaoRepository.save(transacao);
        
        // Retornar DTO
        return TransacaoResponseDTO.builder()
            .id(transacao.getId())
            .dataTransacao(transacao.getDataTransacao())
            .valor(transacao.getValor())
            .descricao(transacao.getDescricao())
            .remetente(UsuarioResponseDTO.builder()
                .id(remetente.getId())
                .nome(remetente.getNome())
                .email(remetente.getEmail())
                .build())
            .destinatario(UsuarioResponseDTO.builder()
                .id(destinatario.getId())
                .nome(destinatario.getNome())
                .email(destinatario.getEmail())
                .build())
            .build();
    }
    
    public Page<HistoricoTransacaoDTO> obterHistoricoTransacoes(Long usuarioId, int page, int size) {
        // Verificar se usuário existe
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new RuntimeException("Usuário não encontrado");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Transacao> transacoes = transacaoRepository.findTransacoesByUsuario(usuarioId, pageable);
        
        return transacoes.map(transacao -> {
            boolean isRemetente = transacao.getRemetente().getId().equals(usuarioId);
            Usuario outroUsuario = isRemetente ? transacao.getDestinatario() : transacao.getRemetente();
            
            return HistoricoTransacaoDTO.builder()
                .id(transacao.getId())
                .dataTransacao(transacao.getDataTransacao())
                .valor(transacao.getValor())
                .descricao(transacao.getDescricao())
                .tipoTransacao(isRemetente ? "ENVIADA" : "RECEBIDA")
                .outroUsuario(UsuarioResponseDTO.builder()
                    .id(outroUsuario.getId())
                    .nome(outroUsuario.getNome())
                    .email(outroUsuario.getEmail())
                    .build())
                .build();
        });
    }
}
