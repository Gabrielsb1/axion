# 🔒 Medidas de Segurança - Axion

## Visão Geral

O sistema Axion foi projetado especificamente para processar documentos sensíveis (matrículas, contratos, escrituras) com máxima segurança. Todas as medidas implementadas visam proteger dados sensíveis contra acesso não autorizado.

## 🛡️ Medidas de Segurança Implementadas

### 1. Processamento em Memória Temporária
- **Arquivos não são salvos permanentemente** no servidor
- Processamento ocorre em diretório temporário do sistema
- Limpeza automática após processamento
- Sem persistência de dados sensíveis

### 2. Criptografia de Arquivos Temporários
- Arquivos são criptografados usando Fernet (AES-128)
- Chave derivada usando PBKDF2 com salt único
- Criptografia automática ao salvar arquivos temporários
- Descriptografia apenas durante processamento

### 3. Limpeza Automática
- **Thread dedicada** para limpeza automática
- Remoção de arquivos antigos baseada em tempo
- Sobrescrita segura antes da exclusão
- Configurável por ambiente (dev/prod)

### 4. Auditoria Completa
- Logs detalhados de todas as operações
- Registro de IP do usuário
- Timestamp de todas as operações
- Rastreamento de arquivos processados

### 5. Exclusão Segura
- Sobrescrita com dados aleatórios antes da exclusão
- Múltiplas passadas de sobrescrita
- Impossibilidade de recuperação após exclusão

## ⚙️ Configurações de Segurança

### Desenvolvimento
```python
SECURE_PROCESSING = True
AUTO_CLEANUP = True
CLEANUP_INTERVAL = timedelta(hours=1)
MAX_FILE_AGE = timedelta(hours=24)
ENCRYPT_TEMP_FILES = True
```

### Produção
```python
SECURE_PROCESSING = True
AUTO_CLEANUP = True
CLEANUP_INTERVAL = timedelta(minutes=30)
MAX_FILE_AGE = timedelta(hours=2)
ENCRYPT_TEMP_FILES = True
```

## 📁 Estrutura de Diretórios Segura

```
axion/
├── temp/axion_secure/     # Arquivos temporários criptografados
├── uploads/               # Vazio (não usado mais)
├── processed/             # Vazio (não usado mais)
├── audit.log              # Logs de auditoria
└── security.py            # Módulo de segurança
```

## 🔍 Logs de Auditoria

O sistema gera logs detalhados em `audit.log`:

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "operation": "FILE_PROCESSED",
  "filename": "matricula_imovel.pdf",
  "user_ip": "192.168.1.100",
  "details": {
    "file_id": "uuid-1234",
    "file_size": 2048576
  }
}
```

## 🚨 Cenários de Segurança

### 1. Acesso Não Autorizado
- Arquivos são criptografados em disco
- Limpeza automática remove arquivos antigos
- Sem persistência de dados sensíveis

### 2. Falha do Sistema
- Thread de limpeza independente
- Limpeza na inicialização do sistema
- Recuperação automática de arquivos órfãos

### 3. Comprometimento do Servidor
- Arquivos temporários são criptografados
- Limpeza automática remove evidências
- Logs de auditoria para investigação

## 🛠️ Comandos de Segurança

### Limpar Arquivos Existentes
```bash
python cleanup_existing_files.py
```

### Verificar Status de Segurança
```bash
python -c "from config import Config; print(f'Segurança: {Config.SECURE_PROCESSING}')"
```

### Verificar Logs de Auditoria
```bash
tail -f audit.log
```

## ⚠️ Recomendações Adicionais

### 1. Configuração do Servidor
- Use HTTPS em produção
- Configure firewall adequadamente
- Monitore logs de acesso

### 2. Backup de Logs
- Faça backup dos logs de auditoria
- Mantenha logs por período adequado
- Proteja logs de auditoria

### 3. Monitoramento
- Monitore uso de disco temporário
- Configure alertas para falhas de limpeza
- Verifique logs de auditoria regularmente

## 🔐 Configurações Avançadas

### Desabilitar Segurança (NÃO RECOMENDADO)
```python
# config.py
SECURE_PROCESSING = False
AUTO_CLEANUP = False
ENCRYPT_TEMP_FILES = False
```

### Configurações Personalizadas
```python
# config.py
CLEANUP_INTERVAL = timedelta(minutes=15)  # Limpeza mais frequente
MAX_FILE_AGE = timedelta(hours=1)         # Arquivos mais novos
AUDIT_LOGGING = True                      # Logs detalhados
```

## 📋 Checklist de Segurança

- [ ] Modo de segurança ativado
- [ ] Criptografia de arquivos habilitada
- [ ] Limpeza automática configurada
- [ ] Logs de auditoria ativos
- [ ] Arquivos existentes limpos
- [ ] HTTPS configurado (produção)
- [ ] Firewall configurado
- [ ] Monitoramento ativo

## 🆘 Suporte de Segurança

Para questões de segurança:
1. Verifique logs de auditoria
2. Execute script de limpeza
3. Verifique configurações de segurança
4. Monitore uso de recursos

---

**⚠️ IMPORTANTE**: Este sistema processa dados sensíveis. Sempre mantenha as medidas de segurança ativas. 