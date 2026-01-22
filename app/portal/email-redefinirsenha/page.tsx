export default function EmailRedefinirSenhaPage() {
    return (
        <div className="min-h-screen bg-white flex justify-center">
            <div style={{ fontFamily: 'sans-serif', fontSize: '16px', color: '#333333', lineHeight: '1.5', padding: '20px', maxWidth: '450px', width: '100%', textAlign: 'left' }}>
                <p style={{ margin: '0 0 16px 0' }}>Olá,</p>
                <p style={{ margin: '0 0 16px 0' }}>Clique neste link para redefinir a senha de login na KwizaPay com sua conta.</p>
                <p style={{ margin: '0 0 24px 0' }}>
                    <a href="#" style={{ color: '#0055ff', textDecoration: 'underline' }}>Redefinir senha</a>
                </p>
                <p style={{ margin: '0 0 24px 0' }}>Se você não solicitou a redefinição da sua senha, ignore este e-mail.</p>
                <p style={{ margin: '0', color: '#333333' }}>Obrigado,<br />Equipe KwizaPay</p>
            </div>
        </div>
    )
}
