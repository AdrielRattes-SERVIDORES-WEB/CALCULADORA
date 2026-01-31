"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    ChevronDown,
    ChevronUp
} from "lucide-react"

export default function LandingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(0)

    const checkoutUrl = process.env.NEXT_PUBLIC_CAKTO_URL || "https://pay.cakto.com.br/DAR7YWr"

    const faqs = [
        {
            question: "Se a Shopee atualizar as taxas a calculadora será atualizada?",
            answer: "Sim, sempre que houver alguma mudança nas taxas você receberá atualizações."
        },
        {
            question: "Posso baixar em meu computador?",
            answer: "Não, pois nosso sistema fica em nuvem para garantir todas as atualizações dos Marketplaces."
        },
        {
            question: "Como vou receber a calculadora?",
            answer: "Após o pagamento, você vai receber um e-mail com os dados de acesso."
        },
        {
            question: "Tenho que ficar pagando por mês?",
            answer: "Não, você só paga 1x e terá para sempre o acesso."
        }
    ]

    const features = [
        {
            image: "https://lucre360.com.br/wp-content/uploads/2025/10/resultado_lucre_360_calculadora_img_9.webp",
            title: "3 Maneiras de você precificar na Shopee",
            description: "Pela margem de Lucro, pelo preço de final de venda ou pelo lucro final que você quer ganhar."
        },
        {
            image: "https://lucre360.com.br/wp-content/uploads/2025/10/resultado_lucre_360_calculadora_img_9-1.webp",
            title: "Calcule seu preço com o gasto em anúncios",
            description: "Descubra o seu número do ROAS ideal de acordo com a margem de lucro que você coloca em seu produto."
        },
        {
            image: "https://lucre360.com.br/wp-content/uploads/2025/10/calculadora_shopee_pro_img_4.webp",
            title: "Análise de Competitividade",
            description: "Descubra se o seu preço está competitivo dentro da Shopee e veja quanto pode lucrar ao igualar ou superar os concorrentes."
        },
        {
            image: "https://lucre360.com.br/wp-content/uploads/2025/10/calculadora_shopee_pro_img_2.webp",
            title: "Projeção Mensal",
            description: "Simule seus resultados e saiba quanto pode faturar e lucrar no mês com cada produto. Planeje seus próximos passos com visão clara de crescimento."
        },
        {
            image: "https://lucre360.com.br/wp-content/uploads/2025/10/calculadora_shopee_pro_img_3.webp",
            title: "Estratégia de Promoção",
            description: "Receba sugestões automáticas de promoções para aumentar seu destaque nas buscas e impulsionar suas vendas nos grandes eventos da Shopee."
        },
        {
            image: "https://lucre360.com.br/wp-content/uploads/2025/10/calculadora_shopee_pro_img_5.webp",
            title: "Aprova Chefe",
            description: "Precisa validar o preço com o financeiro, sócio ou gestor? Com apenas dois cliques, envie toda a precificação formatada direto no WhatsApp para aprovação."
        }
    ]

    const testimonials = [
        "https://lucre360.com.br/wp-content/uploads/2025/10/calculadora_shopee_pro_depoimentos_2.webp",
        "https://lucre360.com.br/wp-content/uploads/2025/11/depo-bruna.webp",
        "https://lucre360.com.br/wp-content/uploads/2025/10/calculadora_shopee_pro_depoimentos_3.webp"
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section - Gradient Background */}
            <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #044A05 0%, #033303 100%)' }}>
                <div className="container mx-auto px-4 py-12 md:py-20">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* Left Content */}
                        <div className="flex-1 text-center lg:text-left">
                            {/* Logo */}
                            <img
                                src="https://lucre360.com.br/wp-content/uploads/2025/10/logo_lucre360_branco_sem_slogan.webp"
                                alt="Lucre 360"
                                className="h-16 md:h-20 mx-auto lg:mx-0 mb-8"
                            />

                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                Pare de vender com <span className="text-[#42B395]">PREJUÍZO</span> na Shopee!
                            </h1>

                            <p className="text-lg md:text-xl text-white/90 mb-6">
                                Calcule o preço correto dos seus produtos em segundos e maximize seus lucros
                            </p>

                            <Button
                                size="lg"
                                onClick={() => document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' })}
                                className="bg-[#42B395] hover:bg-[#3a9f84] text-white text-lg px-8 py-6 rounded-full mb-8"
                            >
                                Garantir minha calculadora agora!
                            </Button>

                            {/* Clients Photo */}
                            <div className="mb-4">
                                <img
                                    src="https://lucre360.com.br/wp-content/uploads/2025/12/foto-shopee-clientes.webp"
                                    alt="Clientes Shopee"
                                    className="h-12 mx-auto lg:mx-0"
                                />
                            </div>
                            <p className="text-white/80 text-sm mb-8">Utilizada por mais de 5.800 vendedores</p>

                            {/* Badges */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center border border-white/20">
                                    <p className="text-white/70 text-sm">Sem mensalidade</p>
                                    <p className="font-bold text-white">você só paga 1x</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center border border-white/20">
                                    <p className="text-white/70 text-sm">Acesso Vitalício</p>
                                    <p className="font-bold text-white">Seu acesso não expira</p>
                                </div>
                            </div>
                        </div>

                        {/* Right - Calculator Image */}
                        <div className="flex-1 relative">
                            <img
                                src="https://lucre360.com.br/wp-content/uploads/2026/01/tela-calcualdora-nova.webp"
                                alt="Calculadora"
                                className="w-full max-w-lg mx-auto"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Problems Section */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                        <span className="bg-gradient-to-r from-[#044A05] to-[#42B395] bg-clip-text text-transparent">
                            Você está cansado de...
                        </span>
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Problem 1 */}
                        <div className="text-center p-6 rounded-2xl bg-gray-50 hover:-translate-y-1 transition-transform">
                            <div className="w-20 h-20 mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 124 124" fill="none" className="w-full h-full">
                                    <path d="M33.9121 0.429688C43.657 -0.131616 79.4542 -0.147305 88.8818 0.40625C103.25 1.25041 110.098 3.36997 115.316 8.58789C122.508 15.7805 123.981 24.842 123.981 61.9023C123.981 98.9622 122.508 108.023 115.316 115.216C108.124 122.408 99.0625 123.881 62.002 123.881C24.9418 123.881 15.8811 122.408 8.68848 115.216C1.49652 108.023 0.0234477 98.9623 0.0234375 61.9023C0.0234436 24.842 1.49641 15.7805 8.68848 8.58789C13.7143 3.56231 21.122 1.16681 33.9121 0.429688ZM62.0381 19.0049C57.6139 18.9828 54.0718 19.0416 53.8271 19.1416C53.5907 19.2386 53.3161 19.5132 53.2168 19.752C53.0705 20.1046 52.0609 28.5429 52.0654 29.375C52.0658 29.5039 51.8307 29.6665 51.543 29.7363C50.5793 29.9703 47.8005 31.1488 46.1748 32.0137C44.1757 33.0771 42.0615 34.4974 40.4531 35.8574C39.7769 36.4292 39.1206 36.9369 38.9932 36.9863C38.8669 37.0349 36.7782 36.203 34.3525 35.1377C29.7352 33.1101 29.3595 33.0217 28.6924 33.8008C27.9666 34.6485 21.0312 46.8967 21.0234 47.3447C21.0188 47.6126 21.1222 47.9719 21.2529 48.1436C21.384 48.315 23.2062 49.7098 25.3018 51.2432C27.8948 53.1403 29.0969 54.133 29.0664 54.3496C29.0417 54.5253 28.8761 55.4827 28.6982 56.4775C28.2413 59.0343 28.2519 64.3032 28.7188 66.8594C28.9101 67.9064 29.0765 68.8637 29.0889 68.9873C29.1011 69.11 27.3971 70.465 25.3018 71.998C23.2064 73.5313 21.3843 74.926 21.2529 75.0977C21.1221 75.2693 21.0187 75.6294 21.0234 75.8975C21.0334 76.3492 27.9667 88.5938 28.6924 89.4414C29.3593 90.2202 29.7357 90.1309 34.3525 88.1035C36.7782 87.0382 38.8669 86.2063 38.9932 86.2549C39.1202 86.304 39.7768 86.8119 40.4531 87.3838C42.9969 89.5348 46.3536 91.5293 49.5225 92.7734C50.448 93.1366 51.2913 93.4353 51.3984 93.4375C51.9332 93.4457 52.0565 93.9887 52.5596 98.5547C52.968 102.262 53.1688 103.484 53.4199 103.794C53.7425 104.192 53.8612 104.199 61.4775 104.252C69.8435 104.31 70.2255 104.269 70.4453 103.29C70.4977 103.056 70.7652 100.807 71.04 98.293C71.3142 95.7837 71.5508 93.725 71.5664 93.7109C76.4248 91.9863 79.85 90.1084 83.2148 87.3252C83.966 86.7038 84.651 86.1953 84.7363 86.1953C84.8241 86.1963 86.8563 87.0614 89.2549 88.1182C93.826 90.1324 94.2047 90.2219 94.873 89.4414C95.621 88.568 102.533 76.3446 102.541 75.8818C102.546 75.6052 102.4 75.2062 102.217 74.9951C102.032 74.7835 100.211 73.3962 98.1689 71.9111C96.1278 70.4269 94.4667 69.1118 94.4756 68.9873C94.4878 68.865 94.6543 67.9071 94.8457 66.8594C95.4606 63.4934 95.254 56.9996 94.4482 54.374C94.3848 54.1673 95.5362 53.2221 98.3398 51.1797C100.529 49.5852 102.371 48.1465 102.436 47.9814C102.499 47.8174 102.55 47.5127 102.55 47.3047C102.549 46.9214 95.3038 34.21 94.7959 33.7012C94.1444 33.0497 93.7073 33.1611 89.2549 35.123C86.8563 36.1798 84.8242 37.0449 84.7363 37.0459C84.651 37.0459 83.966 36.5374 83.2148 35.916C79.9062 33.1793 75.8044 30.9308 71.5645 29.5303C71.5459 29.4992 71.2946 27.3295 71.0039 24.6865C70.5962 20.9794 70.3967 19.759 70.1455 19.4482C69.8224 19.049 69.7156 19.043 62.0381 19.0049ZM58.208 40.5576C60.3919 40.1424 64.6565 40.3182 66.958 40.918C74.6499 42.9232 80.4108 48.678 82.501 56.4453C82.9459 58.0984 82.9971 58.6293 82.9971 61.6211C82.9971 64.6129 82.946 65.1436 82.501 66.7969C80.4119 74.5596 74.7207 80.2508 66.958 82.3398C65.3051 82.7847 64.7739 82.835 61.7822 82.835C58.7905 82.835 58.2598 82.7848 56.6064 82.3398C48.8437 80.2508 43.1525 74.5596 41.0635 66.7969C40.6185 65.1436 40.5684 64.6129 40.5684 61.6211C40.5684 58.6294 40.6186 58.0983 41.0635 56.4453C42.1177 52.5282 43.9396 49.3466 46.7236 46.5625C49.9208 43.3653 53.6238 41.4294 58.208 40.5576ZM61.7822 44.8564C60.5025 44.8565 60.023 44.9292 59.7959 45.1562C59.5611 45.3914 59.4961 45.8955 59.4961 47.499V49.543L58.3691 49.7764C56.9557 50.0682 55.1262 51.2564 54.2422 52.457C53.1777 53.9029 52.7617 55.1928 52.7617 57.0488C52.7617 59.3098 53.2753 60.5771 54.8125 62.1104C56.708 64.0009 58.5814 64.6689 61.9912 64.6689C63.759 64.6689 63.9293 64.7026 64.3633 65.1367C64.6579 65.4313 64.8309 65.8215 64.8311 66.1924C64.8311 66.5634 64.658 66.9543 64.3633 67.249L63.8955 67.7168H58.9424C53.6928 67.7168 53.2228 67.7857 52.8496 68.6045C52.5757 69.2072 52.5756 72.3241 52.8496 72.9258C53.1916 73.6762 53.7919 73.8125 56.7432 73.8125H59.4961V75.7998C59.4961 78.3516 59.5261 78.3848 61.7822 78.3848C64.0481 78.3848 64.0684 78.3614 64.0684 75.7256V73.665L64.7832 73.5312C66.9733 73.121 69.5797 70.9891 70.3232 68.999C71.4348 66.0245 70.8166 63.017 68.6494 60.8496C66.9443 59.1448 65.2153 58.5733 61.7646 58.5732C59.7949 58.5732 59.6417 58.5452 59.2021 58.1055C58.9073 57.8108 58.7344 57.4199 58.7344 57.0488C58.7344 56.6777 58.9072 56.2869 59.2021 55.9922L59.6699 55.5244H64.6221C67.8446 55.5244 69.7354 55.4509 70.0391 55.3135C70.727 54.9999 70.9268 54.3625 70.9268 52.4766C70.9268 50.5907 70.727 49.9532 70.0391 49.6396C69.7661 49.516 68.4331 49.4287 66.8223 49.4287H64.0684V47.4424C64.0684 44.8904 64.0387 44.8564 61.7822 44.8564Z" fill="#42B395" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Ficar confuso com as Taxas</h3>
                            <p className="text-gray-600">
                                A Shopee tem várias taxas diferentes que deixam qualquer vendedor de cabelo em pé na hora de precificar.
                            </p>
                        </div>

                        {/* Problem 2 */}
                        <div className="text-center p-6 rounded-2xl bg-gray-50 hover:-translate-y-1 transition-transform">
                            <div className="w-20 h-20 mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 124 124" fill="none" className="w-full h-full">
                                    <path d="M33.9121 0.429688C43.657 -0.131616 79.4542 -0.147305 88.8818 0.40625C103.25 1.25041 110.098 3.36997 115.316 8.58789C122.508 15.7805 123.981 24.842 123.981 61.9023C123.981 98.9622 122.508 108.023 115.316 115.216C108.124 122.408 99.0625 123.881 62.002 123.881C24.9418 123.881 15.8811 122.408 8.68848 115.216C1.49652 108.023 0.0234477 98.9623 0.0234375 61.9023C0.0234437 24.842 1.49641 15.7805 8.68848 8.58789C13.7143 3.56231 21.122 1.16681 33.9121 0.429688ZM33.6885 89.4561C28.5928 89.4432 24.2366 89.4696 24.0078 89.5146C23.7794 89.5599 23.2843 89.9062 22.9072 90.2832C22.0392 91.1513 21.9699 91.5864 22.0469 95.7256C22.1035 98.7676 22.1273 98.9528 22.5342 99.5234C22.7695 99.8532 23.2908 100.273 23.6924 100.455C24.3734 100.764 25.032 100.787 33.4287 100.791C42.4161 100.795 42.4351 100.794 43.2285 100.394C43.8094 100.101 44.1319 99.7782 44.4248 99.1973C44.7979 98.4573 44.8248 98.1744 44.8213 95.0996C44.8168 91.3654 44.6528 90.6905 43.5547 89.9072L42.9541 89.4795L33.6885 89.4561ZM62.1992 89.4561C57.103 89.4432 52.7458 89.4696 52.5176 89.5146C52.289 89.5601 51.7939 89.9063 51.417 90.2832C50.5491 91.1512 50.4806 91.5867 50.5576 95.7256C50.6143 98.7678 50.638 98.9527 51.0449 99.5234C51.2804 99.8532 51.8016 100.273 52.2031 100.455C52.884 100.764 53.5432 100.787 61.9385 100.791C70.9253 100.795 70.9451 100.794 71.7383 100.394C72.3192 100.101 72.6416 99.7782 72.9346 99.1973C73.3078 98.4572 73.3356 98.1745 73.332 95.0996C73.3276 91.3653 73.1626 90.6905 72.0645 89.9072L71.4648 89.4795L62.1992 89.4561ZM90.709 89.4561C85.6155 89.4432 81.2609 89.4696 81.0283 89.5146C80.7999 89.5599 80.3038 89.9062 79.9268 90.2832C79.059 91.1511 78.9904 91.5869 79.0674 95.7256C79.124 98.7678 79.1477 98.9527 79.5547 99.5234C79.7901 99.8533 80.3113 100.273 80.7129 100.455C81.3939 100.764 82.0521 100.787 90.4482 100.791C99.4364 100.795 99.4556 100.794 100.249 100.394C100.83 100.101 101.151 99.7781 101.444 99.1973C101.818 98.4571 101.845 98.1747 101.842 95.0996C101.837 91.3653 101.672 90.6905 100.574 89.9072L99.9746 89.4795L90.709 89.4561ZM33.6885 72.3506C28.5924 72.3378 24.2361 72.3641 24.0078 72.4092C23.7794 72.4545 23.2842 72.7998 22.9072 73.1768C22.0391 74.0449 21.9699 74.48 22.0469 78.6191C22.1035 81.6608 22.1275 81.8466 22.5342 82.417C22.7695 82.7467 23.2908 83.1661 23.6924 83.3486C24.3734 83.6578 25.032 83.681 33.4287 83.6846C42.4164 83.6885 42.4351 83.6873 43.2285 83.2871C43.8093 82.9942 44.1319 82.6726 44.4248 82.0918C44.7981 81.3516 44.8249 81.0687 44.8213 77.9932C44.8168 74.2592 44.6526 73.585 43.5547 72.8018L42.9541 72.373L33.6885 72.3506ZM62.1992 72.3506C57.103 72.3378 52.7458 72.3641 52.5176 72.4092C52.289 72.4547 51.7938 72.7999 51.417 73.1768C50.5489 74.0449 50.4806 74.4801 50.5576 78.6191C50.6143 81.6614 50.638 81.8463 51.0449 82.417C51.2803 82.7468 51.8015 83.1662 52.2031 83.3486C52.8841 83.6577 53.5426 83.681 61.9385 83.6846C70.9259 83.6885 70.945 83.6872 71.7383 83.2871C72.3191 82.9942 72.6417 82.6725 72.9346 82.0918C73.3079 81.3516 73.3356 81.0687 73.332 77.9932C73.3276 74.259 73.1625 73.585 72.0645 72.8018L71.4648 72.373L62.1992 72.3506ZM25.8984 21.2402C25.246 20.9709 24.8262 20.9378 24.0078 21.0938C23.7794 21.1372 23.2842 21.4814 22.9072 21.8584C22.0102 22.7554 21.8201 23.7757 22.3379 24.9111C22.6059 25.4968 26.3188 29.3068 37.2783 40.2412C53.3102 56.2366 52.4703 55.5004 54.1357 55.0127C54.7827 54.8235 55.8211 53.8662 61.2646 48.4385L67.6367 42.085L84.999 59.4473L82.2148 62.2578C79.972 64.5208 79.3854 65.2153 79.2051 65.8252C78.7943 67.2138 79.5145 68.6538 80.8662 69.1465C82.1534 69.6154 98.8069 72.3171 99.5918 72.1846C100.524 72.0269 101.589 70.9621 101.746 70.0303C101.88 69.2352 99.1791 52.5643 98.7119 51.3047C98.2098 49.951 96.7737 49.2333 95.3867 49.6436C94.777 49.8239 94.0822 50.4104 91.8203 52.6523L89.0107 55.4365L79.0801 45.5264C68.4137 34.8836 68.619 35.0586 67.0508 35.3145C66.35 35.4289 65.8441 35.8885 59.835 41.875L53.373 48.3125L39.9678 34.9131C30.5709 25.5208 26.3628 21.4318 25.8984 21.2402ZM33.6885 55.2441C28.5925 55.2313 24.2362 55.2577 24.0078 55.3027C23.7794 55.348 23.2842 55.6934 22.9072 56.0703C22.0391 56.9384 21.9699 57.3744 22.0469 61.5137C22.1035 64.5557 22.1272 64.7408 22.5342 65.3115C22.7695 65.6413 23.2908 66.0607 23.6924 66.2432C24.3734 66.5523 25.032 66.5746 33.4287 66.5781C42.4158 66.582 42.4352 66.5818 43.2285 66.1816C43.8094 65.8887 44.1319 65.5662 44.4248 64.9854C44.798 64.2453 44.8249 63.962 44.8213 60.8867C44.8168 57.1529 44.6527 56.4786 43.5547 55.6953L42.9541 55.2676L33.6885 55.2441Z" fill="#42B395" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Vender com Prejuízo</h3>
                            <p className="text-gray-600">
                                Descobrir depois que o preço estava errado e você perdeu dinheiro em cada venda.
                            </p>
                        </div>

                        {/* Problem 3 */}
                        <div className="text-center p-6 rounded-2xl bg-gray-50 hover:-translate-y-1 transition-transform">
                            <div className="w-20 h-20 mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 124 124" fill="none" className="w-full h-full">
                                    <path d="M33.9121 0.429688C43.657 -0.131616 79.4542 -0.147305 88.8818 0.40625C103.25 1.25041 110.098 3.36997 115.316 8.58789C122.508 15.7805 123.981 24.842 123.981 61.9023C123.981 98.9622 122.508 108.023 115.316 115.216C108.124 122.408 99.0625 123.881 62.002 123.881C24.9418 123.881 15.8811 122.408 8.68848 115.216C1.49652 108.023 0.0234477 98.9623 0.0234375 61.9023C0.0234437 24.842 1.49641 15.7805 8.68848 8.58789C13.7143 3.56231 21.122 1.16681 33.9121 0.429688ZM48.2666 20.0254C37.4109 20.0395 28.3321 20.089 28.0918 20.1348C27.3182 20.2823 26.2253 21.5613 26.0957 22.4717C26.0323 22.9175 26.0059 41.0078 26.0361 62.6719L26.0908 102.062L26.541 102.693C26.7887 103.04 27.337 103.482 27.7598 103.674C28.5003 104.01 29.765 104.023 62.0176 104.027L95.5059 104.031L96.3428 103.609C96.9541 103.301 97.2933 102.962 97.6016 102.351L98.0234 101.514V47.0176L83.9697 46.9668C70.1074 46.9171 69.9082 46.9108 69.3975 46.5293C69.1126 46.3166 68.7058 45.9098 68.4932 45.625C68.1128 45.1157 68.1057 44.8999 68.0557 32.5537L68.0049 20L48.2666 20.0254ZM41.7041 84.1299C42.6736 82.9777 41.6152 83.0313 62.2305 83.0762C80.9783 83.1167 81.1187 83.12 81.6328 83.5039C82.6171 84.2387 82.9238 84.8384 82.9238 86.0244C82.9238 87.2105 82.617 87.8101 81.6328 88.5449C81.1191 88.9287 80.965 88.932 62.418 88.9873C49.6474 89.0256 43.5047 88.9805 43.0361 88.8447C41.1304 88.2925 40.3943 85.6865 41.7041 84.1299ZM41.7041 72.125C42.6732 70.973 41.6167 71.0274 62.2305 71.0723C80.9786 71.1128 81.1187 71.116 81.6328 71.5C82.617 72.2348 82.9238 72.8344 82.9238 74.0205C82.9238 75.2065 82.6171 75.8062 81.6328 76.541C81.1191 76.9248 80.9648 76.9281 62.418 76.9834C49.6486 77.0217 43.5056 76.9766 43.0361 76.8408C41.1304 76.2886 40.3943 73.6816 41.7041 72.125ZM53.0068 34.9727L55.0566 35.0361C56.7721 35.0892 57.1914 35.1627 57.624 35.4863C58.608 36.2218 58.915 36.8211 58.915 38.0068C58.915 39.1928 58.6082 39.7921 57.624 40.5273C57.1362 40.892 56.8177 40.9174 52.0557 40.9697L47.0049 41.0254V43.9922L52.0557 44.0479C56.8169 44.1002 57.1363 44.1248 57.624 44.4893C57.9088 44.702 58.3156 45.1096 58.5283 45.3945C58.8987 45.8906 58.915 46.1492 58.915 51.5117C58.915 56.8747 58.8988 57.1338 58.5283 57.6299C57.6898 58.753 57.2718 58.9159 55.0566 58.9844L53.0068 59.0479V62.0156H47.0049V59.0479L44.9541 58.9844C43.2387 58.9313 42.8194 58.8579 42.3867 58.5342C41.4029 57.7988 41.0957 57.1994 41.0957 56.0137C41.0957 54.8278 41.4028 54.2283 42.3867 53.4932C42.8746 53.1285 43.1939 53.1031 47.9561 53.0508L53.0068 52.9951V50.0283L47.9561 49.9727C43.1939 49.9203 42.8746 49.8959 42.3867 49.5312C42.102 49.3185 41.6951 48.9109 41.4824 48.626C41.1122 48.1301 41.0957 47.8704 41.0957 42.5088C41.0957 37.1458 41.112 36.8867 41.4824 36.3906C42.321 35.2673 42.739 35.1046 44.9541 35.0361L47.0049 34.9727V32.0049H53.0068V34.9727ZM74.0146 41.0078H96.0469L95.4873 40.4707C95.1791 40.1746 90.4967 36.0682 85.0811 31.3457C79.6651 26.623 74.9594 22.5013 74.624 22.1865L74.0146 21.6152V41.0078Z" fill="#42B395" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Planilhas Complicadas</h3>
                            <p className="text-gray-600">
                                Ter que criar fórmulas no Excel quando você só quer vender seus produtos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="py-16 md:py-24 px-4 bg-gray-50">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                        <span className="bg-gradient-to-r from-[#044A05] to-[#42B395] bg-clip-text text-transparent">
                            A solução que você precisava!
                        </span>
                    </h2>
                    <p className="text-gray-600 text-center mb-12 text-lg">
                        Com a nossa Calculadora de Precificação, terá:
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="bg-white border-0 shadow-md hover:-translate-y-1 transition-transform overflow-hidden">
                                <CardContent className="p-0">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                        <p className="text-gray-600 text-sm">{feature.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Video Section */}
                    <div className="mt-16 max-w-3xl mx-auto">
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

                    <div className="text-center mt-12">
                        <Button
                            size="lg"
                            onClick={() => document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-[#42B395] hover:bg-[#3a9f84] text-white text-lg px-8 py-6 rounded-full"
                        >
                            Quero minha calculadora agora!
                        </Button>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <p className="text-gray-500 text-center mb-2">Veja o que os</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        <span className="bg-gradient-to-r from-[#044A05] to-[#42B395] bg-clip-text text-transparent">
                            Nossos clientes estão falando
                        </span>
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="rounded-xl overflow-hidden shadow-lg">
                                <img
                                    src={testimonial}
                                    alt={`Depoimento ${index + 1}`}
                                    className="w-full"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="oferta" className="py-16 md:py-24 px-4 bg-gray-50">
                <div className="container mx-auto max-w-xl">
                    <Card className="border-0 shadow-2xl overflow-hidden">
                        <CardContent className="p-8 md:p-12 text-center">
                            {/* Logo */}
                            <img
                                src="https://lucre360.com.br/wp-content/uploads/2025/10/logo_lucre360_color_preto_sem_slogan.webp"
                                alt="Lucre 360"
                                className="h-12 mx-auto mb-8"
                            />

                            <h2 className="text-2xl md:text-3xl font-bold mb-6">
                                <span className="bg-gradient-to-r from-[#044A05] to-[#42B395] bg-clip-text text-transparent">
                                    Não Perca mais Dinheiro!
                                </span>
                            </h2>

                            <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#42B395] font-bold">•</span>
                                    <span className="text-gray-700">Receba o acesso imediato pelo seu WhatsApp e e-mail.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#42B395] font-bold">•</span>
                                    <span className="text-gray-700">Tenha o aplicativo instalado no seu Computador e Celular.</span>
                                </li>
                            </ul>

                            <div className="border-t border-dashed border-gray-300 my-8"></div>

                            <p className="text-gray-500 text-lg mb-2">
                                de <span className="line-through font-bold">R$ 90,00</span> por
                            </p>

                            <div className="mb-8">
                                <span className="text-5xl md:text-6xl font-extrabold text-[#044A05]">R$ 29,99</span>
                            </div>

                            <Button
                                size="lg"
                                onClick={() => window.location.href = checkoutUrl}
                                className="w-full bg-[#42B395] hover:bg-[#3a9f84] text-white text-lg py-6 rounded-full"
                            >
                                Quero minha Calculadora!
                            </Button>

                            <p className="text-gray-500 text-sm mt-4">
                                <strong>Sem mensalidade!</strong> Você só paga 1x.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Bonus Section */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                        Bônus Especial
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Bonus 1 - ML Calculator */}
                        <Card className="bg-gray-50 border-0 shadow-md overflow-hidden">
                            <CardContent className="p-6">
                                <img
                                    src="https://lucre360.com.br/wp-content/uploads/2025/10/calculadora_shopee_pro_img_6.webp"
                                    alt="Calculadora ML"
                                    className="w-full h-48 object-cover rounded-lg mb-6"
                                />
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Calculadora do Mercado Livre</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Quer expandir além da Shopee? Então domine também o campo de batalha do Mercado Livre.
                                </p>
                                <p className="text-gray-600 text-sm mb-4">
                                    Com essa calculadora exclusiva, você descobre quanto realmente vai lucrar em cada venda antes de subir o anúncio.
                                </p>
                                <p className="text-[#044A05] font-semibold text-sm">
                                    Sem achismo. Sem erro. Pura estratégia pra vender com margem.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Bonus 2 - Thank You Card */}
                        <Card className="bg-gray-50 border-0 shadow-md overflow-hidden">
                            <CardContent className="p-6">
                                <img
                                    src="https://lucre360.com.br/wp-content/uploads/2025/10/calculadora_shopee_pro_img_8.webp"
                                    alt="Cartão de Agradecimento"
                                    className="w-full h-48 object-cover rounded-lg mb-6"
                                />
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Cartão de Agradecimento Profissional</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Um simples detalhe que aumenta sua reputação e fideliza clientes.
                                </p>
                                <p className="text-gray-600 text-sm mb-4">
                                    Você recebe um modelo pronto de cartão de agradecimento, só precisa colocar sua logo, imprimir e enviar junto com o pedido.
                                </p>
                                <p className="text-[#044A05] font-semibold text-sm">
                                    Transforme cada entrega em uma experiência de marca.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-16 md:py-24 px-4" style={{ background: 'linear-gradient(180deg, #044A05 0%, #033303 100%)' }}>
                <div className="container mx-auto max-w-4xl">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-shrink-0">
                            <img
                                src="https://lucre360.com.br/wp-content/uploads/2025/10/calculadora_shopee_pro_img_7.webp"
                                alt="Paulo Henrique"
                                className="w-40 h-40 rounded-full object-cover border-4 border-white/20"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold text-white mb-4">
                                <span className="bg-gradient-to-r from-white to-[#42B395] bg-clip-text text-transparent">
                                    Paulo Henrique
                                </span>
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-4">
                                No início, enfrentei os mesmos desafios que a maioria dos vendedores da Shopee enfrenta: precificação confusa, margens apertadas e métricas que não faziam sentido. Foi dessa luta diária que nasceu minha primeira solução — uma Calculadora criada para resolver um problema real de um cliente que não sabia quanto realmente ganhava com seus produtos.
                            </p>
                            <p className="text-white/80 text-sm leading-relaxed">
                                Hoje, atuo como estrategista de marketplace, com foco em Shopee, ajudando marcas e vendedores a conquistarem espaço, aumentarem suas margens e vencerem de forma inteligente nesse campo competitivo que é o e-commerce.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Button
                            size="lg"
                            onClick={() => document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-[#42B395] hover:bg-[#3a9f84] text-white text-lg px-8 py-6 rounded-full"
                        >
                            Garantir minha calculadora agora!
                        </Button>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 md:py-24 px-4 bg-gray-50">
                <div className="container mx-auto max-w-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        <span className="bg-gradient-to-r from-[#044A05] to-[#42B395] bg-clip-text text-transparent">
                            Perguntas Frequentes
                        </span>
                    </h2>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-xl border cursor-pointer transition-all shadow-sm ${openFaq === index ? 'border-[#42B395]' : 'border-gray-200'}`}
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            >
                                <div className="p-5 flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 pr-4">{faq.question}</h3>
                                    {openFaq === index ? (
                                        <ChevronUp className="h-5 w-5 text-[#42B395] flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                    )}
                                </div>
                                {openFaq === index && (
                                    <div className="px-5 pb-5">
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-12 px-4 bg-white">
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
                                <p className="text-sm text-gray-500">Fale Conosco</p>
                                <p className="font-semibold text-gray-900">no WhatsApp</p>
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
                        Disclaimer: A Calculadora do Lucre 360 é uma ferramenta independente e não tem qualquer tipo de ligação com a marca Shopee.
                    </p>
                    <div className="flex justify-center gap-6 text-sm">
                        <a href="#" className="text-gray-400 hover:text-[#42B395]">
                            Política de Privacidade
                        </a>
                        <a href="#" className="text-gray-400 hover:text-[#42B395]">
                            Termos de Uso
                        </a>
                        <a href="/login" className="text-gray-400 hover:text-[#42B395]">
                            Já sou assinante
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
