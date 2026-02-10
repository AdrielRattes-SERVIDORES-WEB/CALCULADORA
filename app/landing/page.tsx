"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    ChevronDown,
    ChevronUp,
    CheckCircle2
} from "lucide-react"

export default function LandingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(0)

    const checkoutUrl = process.env.NEXT_PUBLIC_CAKTO_URL || "https://pay.cakto.com.br/jc9vpbz_715904"

    const faqs = [
        {
            question: "Como vou receber a calculadora?",
            answer: "Após o pagamento, você receberá um e-mail com os dados de acesso imediatamente. Você pode usar no computador e celular."
        },
        {
            question: "Tenho que pagar todo mês?",
            answer: "Não! Você paga apenas 1x e tem acesso vitalício. Sem mensalidades, sem surpresas."
        },
        {
            question: "As taxas são atualizadas?",
            answer: "Sim! Sempre que a Shopee, Mercado Livre ou Amazon mudarem as taxas, você recebe a atualização automaticamente."
        }
    ]

    const features = [
        {
            icon: "💰",
            title: "3 Formas de Precificar",
            description: "Por margem, preço final ou lucro desejado"
        },
        {
            icon: "📊",
            title: "Análise de Competitividade",
            description: "Veja se seu preço está competitivo"
        },
        {
            icon: "📈",
            title: "Projeção Mensal",
            description: "Simule faturamento e lucro do mês"
        },
        {
            icon: "🎯",
            title: "Cálculo com Anúncios",
            description: "Descubra seu ROAS ideal"
        }
    ]

    const testimonials = [
        "https://lucre360.com.br/wp-content/uploads/2025/10/calculadora_shopee_pro_depoimentos_2.webp",
        "https://lucre360.com.br/wp-content/uploads/2025/11/depo-bruna.webp",
        "https://lucre360.com.br/wp-content/uploads/2025/10/calculadora_shopee_pro_depoimentos_3.webp"
    ]

    return (
        <div className="min-h-screen bg-white">
            <style jsx>{`
                @keyframes strong-pulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                    }
                    50% {
                        transform: scale(1.05);
                        box-shadow: 0 0 20px 10px rgba(16, 185, 129, 0.4);
                    }
                }
                .cta-pulse {
                    animation: strong-pulse 1.5s ease-in-out infinite;
                }
            `}</style>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
                <div className="container mx-auto px-4 py-12 md:py-20">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        {/* Left Content */}
                        <div className="flex-1 text-center lg:text-left">
                            {/* Logo */}
                            <img
                                src="https://lucre360.com.br/wp-content/uploads/2025/10/logo_lucre360_color_preto_sem_slogan.webp"
                                alt="Lucre 360"
                                className="h-14 mx-auto lg:mx-0 mb-8"
                            />

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                                Descubra se você está <span className="text-[#FF6B35]">PERDENDO DINHEIRO</span> em cada venda
                            </h1>

                            <p className="text-xl md:text-2xl text-gray-700 mb-8 font-medium">
                                Calcule o preço certo em segundos e pare de vender com prejuízo
                            </p>

                            {/* Marketplace Logos */}
                            <div className="mb-8">
                                <p className="text-sm text-gray-600 mb-4 font-semibold">FUNCIONA PARA:</p>
                                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6">
                                    <div className="bg-white px-6 py-3 rounded-lg shadow-md">
                                        <span className="text-[#EE4D2D] font-bold text-2xl">Shopee</span>
                                    </div>
                                    <div className="bg-white px-6 py-3 rounded-lg shadow-md">
                                        <span className="text-[#FFE600] font-bold text-2xl" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>Mercado Livre</span>
                                    </div>
                                    <div className="bg-white px-6 py-3 rounded-lg shadow-md">
                                        <span className="text-[#FF9900] font-bold text-2xl">Amazon</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                onClick={() => window.location.href = checkoutUrl}
                                className="cta-pulse bg-[#10B981] hover:bg-[#059669] text-white text-xl px-10 py-7 rounded-full shadow-xl hover:shadow-2xl transition-all mb-8"
                            >
                                Quero Calcular Meu Lucro Agora! 🚀
                            </Button>

                            {/* Social Proof */}
                            <div className="flex flex-col items-center lg:items-start gap-3">
                                <img
                                    src="https://lucre360.com.br/wp-content/uploads/2025/12/foto-shopee-clientes.webp"
                                    alt="Clientes"
                                    className="h-12"
                                />
                                <p className="text-gray-700 font-semibold">
                                    ⭐ Mais de 5.800 vendedores já usam
                                </p>
                            </div>
                        </div>

                        {/* Right - Calculator Image */}
                        <div className="flex-1 relative">
                            <div className="relative">
                                <img
                                    src="https://lucre360.com.br/wp-content/uploads/2026/01/tela-calcualdora-nova.webp"
                                    alt="Calculadora"
                                    className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-12 flex flex-wrap justify-center gap-6">
                        <div className="bg-white px-6 py-4 rounded-xl shadow-md border-2 border-green-500">
                            <p className="text-green-600 font-bold text-lg">✓ Sem Mensalidade</p>
                        </div>
                        <div className="bg-white px-6 py-4 rounded-xl shadow-md border-2 border-blue-500">
                            <p className="text-blue-600 font-bold text-lg">✓ Acesso Vitalício</p>
                        </div>
                        <div className="bg-white px-6 py-4 rounded-xl shadow-md border-2 border-purple-500">
                            <p className="text-purple-600 font-bold text-lg">✓ Acesso Imediato</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problems Section */}
            <section className="py-16 md:py-20 px-4 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                        Você está <span className="text-[#FF6B35]">cansado</span> de...
                    </h2>
                    <p className="text-center text-gray-600 mb-12 text-lg">Esses problemas acabam HOJE</p>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-100 hover:shadow-xl transition-shadow">
                            <div className="text-6xl mb-4">😰</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Ficar Confuso com as Taxas</h3>
                            <p className="text-gray-700">
                                Taxas de comissão, frete, anúncios... você não sabe quanto realmente sobra
                            </p>
                        </div>

                        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-100 hover:shadow-xl transition-shadow">
                            <div className="text-6xl mb-4">💸</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Vender com Prejuízo</h3>
                            <p className="text-gray-700">
                                Descobrir tarde demais que o preço estava errado e você perdeu dinheiro
                            </p>
                        </div>

                        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-100 hover:shadow-xl transition-shadow">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Planilhas Complicadas</h3>
                            <p className="text-gray-700">
                                Perder tempo criando fórmulas quando você só quer vender
                            </p>
                        </div>
                    </div>

                    {/* CTA after Problems */}
                    <div className="text-center mt-12">
                        <Button
                            size="lg"
                            onClick={() => window.location.href = checkoutUrl}
                            className="cta-pulse bg-[#10B981] hover:bg-[#059669] text-white text-xl px-10 py-7 rounded-full shadow-xl hover:shadow-2xl transition-all"
                        >
                            Quero Resolver Isso Agora! 🚀
                        </Button>
                        <p className="text-gray-600 mt-4 font-semibold">✓ Acesso imediato por apenas R$ 9,90</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                        A <span className="text-[#004E89]">Solução Completa</span> para Precificar
                    </h2>
                    <p className="text-center text-gray-600 mb-12 text-lg">Tudo que você precisa em um só lugar</p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {features.map((feature, index) => (
                            <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                                <CardContent className="p-6 text-center">
                                    <div className="text-5xl mb-4">{feature.icon}</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 text-sm">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Bonus Features */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-[#1A936F]">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">🎁</div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">BÔNUS: Calculadora Mercado Livre</h3>
                                    <p className="text-gray-600 text-sm">Precifique também no ML com a mesma precisão</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-[#1A936F]">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">🎁</div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">BÔNUS: Cartão de Agradecimento</h3>
                                    <p className="text-gray-600 text-sm">Modelo profissional para fidelizar clientes</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Video */}
                    <div className="mt-12 max-w-3xl mx-auto">
                        <h3 className="text-2xl font-bold text-center mb-6">Veja como é simples usar:</h3>
                        <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/MO9fYPgAPCY"
                                title="Demonstração"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>

                    {/* CTA after Video */}
                    <div className="text-center mt-12">
                        <Button
                            size="lg"
                            onClick={() => window.location.href = checkoutUrl}
                            className="cta-pulse bg-[#10B981] hover:bg-[#059669] text-white text-xl px-10 py-7 rounded-full shadow-xl hover:shadow-2xl transition-all"
                        >
                            Sim! Quero Minha Calculadora Agora 🎯
                        </Button>
                        <p className="text-gray-600 mt-4 font-semibold">✓ Acesso imediato • ✓ Pagamento único de R$ 9,90</p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 md:py-20 px-4 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        Veja o que <span className="text-[#FF6B35]">nossos clientes</span> dizem
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
                                <img
                                    src={testimonial}
                                    alt={`Depoimento ${index + 1}`}
                                    className="w-full"
                                />
                            </div>
                        ))}
                    </div>

                    {/* CTA after Testimonials */}
                    <div className="text-center mt-12">
                        <p className="text-gray-700 mb-4 text-lg font-semibold">Junte-se a mais de 5.800 vendedores satisfeitos!</p>
                        <Button
                            size="lg"
                            onClick={() => window.location.href = checkoutUrl}
                            className="cta-pulse bg-[#10B981] hover:bg-[#059669] text-white text-xl px-10 py-7 rounded-full shadow-xl hover:shadow-2xl transition-all"
                        >
                            Garantir Minha Calculadora por R$ 9,90 💰
                        </Button>
                        <p className="text-gray-600 mt-4 font-semibold">🔒 Pagamento 100% seguro</p>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="oferta" className="py-16 md:py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50">
                <div className="container mx-auto max-w-xl">
                    <Card className="border-4 border-[#FF6B35] shadow-2xl overflow-hidden">
                        <CardContent className="p-8 md:p-12 text-center bg-white">
                            <div className="bg-[#FF6B35] text-white py-2 px-6 rounded-full inline-block mb-6 font-bold">
                                🔥 OFERTA ESPECIAL
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                                Pare de Perder Dinheiro HOJE!
                            </h2>

                            <ul className="text-left space-y-4 mb-8 max-w-md mx-auto">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="text-green-500 flex-shrink-0 mt-1" size={24} />
                                    <span className="text-gray-700 font-medium">Acesso imediato por WhatsApp e e-mail</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="text-green-500 flex-shrink-0 mt-1" size={24} />
                                    <span className="text-gray-700 font-medium">Funciona em computador e celular</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="text-green-500 flex-shrink-0 mt-1" size={24} />
                                    <span className="text-gray-700 font-medium">Shopee + Mercado Livre + Amazon</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="text-green-500 flex-shrink-0 mt-1" size={24} />
                                    <span className="text-gray-700 font-medium">Atualizações automáticas das taxas</span>
                                </li>
                            </ul>

                            <div className="border-t-2 border-dashed border-gray-300 my-8"></div>

                            <p className="text-gray-500 text-xl mb-2">
                                de <span className="line-through font-bold">R$ 29,99</span> por apenas
                            </p>

                            <div className="mb-8">
                                <span className="text-6xl md:text-7xl font-extrabold text-[#10B981]">R$ 9,90</span>
                                <p className="text-gray-600 font-bold mt-2 text-lg">Pagamento único</p>
                            </div>

                            <Button
                                size="lg"
                                onClick={() => window.location.href = checkoutUrl}
                                className="cta-pulse w-full bg-[#10B981] hover:bg-[#059669] text-white text-xl py-7 rounded-full shadow-xl hover:shadow-2xl transition-all mb-6"
                            >
                                SIM! Quero Minha Calculadora Agora 🚀
                            </Button>

                            <div className="flex justify-center gap-4 mt-6">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8 opacity-60" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" className="h-8 opacity-60" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-8 opacity-60" />
                            </div>
                            <p className="text-gray-500 text-sm mt-4">🔒 Pagamento 100% seguro</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 md:py-20 px-4 bg-white">
                <div className="container mx-auto max-w-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        Perguntas <span className="text-[#004E89]">Frequentes</span>
                    </h2>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-xl border-2 cursor-pointer transition-all shadow-md ${openFaq === index ? 'border-[#10B981] shadow-lg' : 'border-gray-200'}`}
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            >
                                <div className="p-6 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 pr-4">{faq.question}</h3>
                                    {openFaq === index ? (
                                        <ChevronUp className="h-6 w-6 text-[#10B981] flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="h-6 w-6 text-gray-400 flex-shrink-0" />
                                    )}
                                </div>
                                {openFaq === index && (
                                    <div className="px-6 pb-6">
                                        <p className="text-gray-700 text-lg">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-16 px-4 bg-gradient-to-r from-[#004E89] to-[#1A936F]">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Não perca mais dinheiro em cada venda!
                    </h2>
                    <p className="text-xl text-white/90 mb-8">
                        Junte-se a mais de 5.800 vendedores que já calculam seus lucros com precisão
                    </p>
                    <Button
                        size="lg"
                        onClick={() => window.location.href = checkoutUrl}
                        className="cta-pulse bg-[#10B981] hover:bg-[#059669] text-white text-xl px-12 py-7 rounded-full shadow-2xl hover:shadow-3xl transition-all"
                    >
                        Garantir Minha Calculadora por R$ 9,90 🚀
                    </Button>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-12 px-4 bg-gray-50">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                        <a
                            href="https://wa.me/5585981177881?text=Oi%20Paulinho,%20t%C3%B4%20com%20d%C3%BAvidas%20em%20adquirir%20sua%20Calculadora%20da%20Shopee"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 hover:-translate-y-1 transition-transform"
                        >
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" viewBox="0 0 448 512" fill="currentColor">
                                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Dúvidas?</p>
                                <p className="font-semibold text-gray-900">Fale no WhatsApp</p>
                            </div>
                        </a>

                        <img
                            src="https://lucre360.com.br/wp-content/uploads/2025/10/selo_site_protegido_cloudflare_calculadora_shopee_pro.webp"
                            alt="Site Protegido"
                            className="h-16"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 bg-gray-900">
                <div className="container mx-auto text-center">
                    <p className="text-white font-bold mb-4">
                        Lucre 360 © 2025 - Todos os direitos reservados.
                    </p>
                    <p className="text-gray-400 text-xs max-w-xl mx-auto mb-6">
                        A Calculadora do Lucre 360 é uma ferramenta independente e não tem qualquer tipo de ligação com as marcas Shopee, Mercado Livre ou Amazon.
                    </p>
                    <div className="flex justify-center gap-6 text-sm">
                        <a href="#" className="text-gray-400 hover:text-[#FF6B35]">
                            Política de Privacidade
                        </a>
                        <a href="#" className="text-gray-400 hover:text-[#FF6B35]">
                            Termos de Uso
                        </a>
                        <a href="/login" className="text-gray-400 hover:text-[#FF6B35]">
                            Já sou cliente
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
