package com.CDCBank.bancoDigital.repository;

import com.CDCBank.bancoDigital.models.Transacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    
    @Query("SELECT t FROM Transacao t WHERE t.remetente.id = :usuarioId OR t.destinatario.id = :usuarioId ORDER BY t.dataTransacao DESC")
    Page<Transacao> findTransacoesByUsuario(@Param("usuarioId") Long usuarioId, Pageable pageable);
}
