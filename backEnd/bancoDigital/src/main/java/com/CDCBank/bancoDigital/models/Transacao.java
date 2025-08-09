package com.CDCBank.bancoDigital.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "transacao")
public class Transacao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "transacao_seq")
    @SequenceGenerator(name = "transacao_seq", sequenceName = "transacao_seq", allocationSize = 1)
    private Long id;
    
    @Column(nullable = false)
    private LocalDateTime dataTransacao;
    
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal valor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_remetente", nullable = false)
    private Usuario remetente;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_destinatario", nullable = false)
    private Usuario destinatario;
    
    @Column(length = 500)
    private String descricao;
    
    @PrePersist
    protected void onCreate() {
        dataTransacao = LocalDateTime.now();
    }
}