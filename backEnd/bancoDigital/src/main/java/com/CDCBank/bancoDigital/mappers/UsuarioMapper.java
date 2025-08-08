package com.CDCBank.bancoDigital.mappers;

import org.springframework.stereotype.Component;

import com.CDCBank.bancoDigital.dto.request.UsuarioCreateDTO;
import com.CDCBank.bancoDigital.dto.response.UsuarioCreateResponseDTO;
import com.CDCBank.bancoDigital.models.Usuario;

@Component
public class UsuarioMapper {

    public UsuarioCreateResponseDTO toResponseDTO(Usuario usuario) {
        if (usuario == null) {
            return null;
        }

        return UsuarioCreateResponseDTO.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .message("Usuário criado com sucesso")
                .build();
    }

    // public Usuario toEntity(UsuarioResponseDTO dto) {
    //     if (dto == null) {
    //         return null;
    //     }

    //     Usuario usuario = new Usuario();
    //     usuario.setId(dto.getId());
    //     usuario.setNome(dto.getNome());
    //     usuario.setEmail(dto.getEmail());
    //     usuario.setTipoUsuario(dto.getTipoUsuario());
        
    //     return usuario;
    // }
}
