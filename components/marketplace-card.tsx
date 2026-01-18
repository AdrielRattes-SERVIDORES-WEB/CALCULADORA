import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CalculationResult {
  // Generic fields (Shopee/Amazon)
  sellingPrice?: number
  costPrice?: number
  taxaFixa?: number
  taxasVariaveisReais?: number
  taxaVariavelPercentual?: number
  lucroLiquidoReais?: number
  margemRealPercentual?: number
  totalVenda?: number
  totalCusto?: number
  totalTaxaFixa?: number
  totalTaxasVariaveis?: number
  totalLucroLiquido?: number
  valorRestante?: number
  quantity?: number
  taxBreakdown?: string
  error?: boolean
  message?: string
  // ML-specific fields
  precoVenda?: number
  taxaMLReais?: number
  taxaFixaML?: number
  custoLogistico?: number
  reembolsoFlex?: number
  repasseLiquido?: number
  lucroLiquido?: number
  margemReal?: number
  adLevel?: string
  shippingMode?: string
  isFreteGratis?: boolean
  // Amazon-specific fields
  price?: number
  taxRate?: number
  taxAmount?: number
  revenuePostTax?: number
  logisticMode?: string
  tierInfo?: string
}

interface MarketplaceCardProps {
  title: string
  icon: React.ReactNode
  colorClass: string
  result: CalculationResult | null
}

export function MarketplaceCard({ title, icon, colorClass, result }: MarketplaceCardProps) {
  if (!result) return null

  if (result.error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">{result.message}</p>
        </CardContent>
      </Card>
    )
  }

  // Determine result type
  const isMLResult = result.adLevel !== undefined
  const isAmazonResult = result.logisticMode !== undefined

  // === NORMALIZE VALUES FOR ALL MARKETPLACES ===
  const precoSugerido = result.price ?? result.precoVenda ?? result.sellingPrice ?? 0
  const custoProduto = result.costPrice ?? 0

  // Taxa percentual (comissão) - Amazon uses taxRate directly
  const taxaPercentual = isAmazonResult
    ? ((result.taxRate ?? 0) * 100)
    : isMLResult
      ? ((result.taxaMLReais ?? 0) / precoSugerido * 100)
      : (result.taxaVariavelPercentual ?? 0)

  // Comissão em reais
  const comissao = isAmazonResult
    ? (result.taxAmount ?? 0)
    : isMLResult
      ? (result.taxaMLReais ?? 0)
      : ((result.taxasVariaveisReais ?? 0) + (result.taxaFixa ?? 0))

  // Custo de envio (separado)
  const custoEnvio = result.custoLogistico ?? (isMLResult ? 0 : (result.taxaFixa ?? 0))

  // Receita pós-taxas
  const receitaPosTaxas = result.revenuePostTax ?? (precoSugerido - comissao)

  // Repasse líquido (o que cai na conta)
  const repasseLiquido = result.repasseLiquido ?? (precoSugerido - comissao - custoEnvio)

  // Lucro líquido final
  const lucroLiquido = result.lucroLiquido ?? result.lucroLiquidoReais ?? 0
  const margemReal = result.margemReal ?? result.margemRealPercentual ?? 0

  // Tax breakdown for tooltip
  const taxBreakdown = isAmazonResult
    ? `${taxaPercentual.toFixed(1)}% Comissão Amazon`
    : isMLResult
      ? `${taxaPercentual.toFixed(1)}% Comissão${result.taxaFixaML ? ` + R$ ${result.taxaFixaML.toFixed(2)} Taxa Fixa` : ''}`
      : (result.taxBreakdown ?? `${taxaPercentual.toFixed(1)}%`)

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${colorClass}`}>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preço Sugerido */}
        <div className={`text-center p-3 rounded-lg bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
          <p className="text-xs text-gray-600 mb-1">Preço Sugerido</p>
          <p className={`text-2xl font-bold ${colorClass}`}>
            R$ {precoSugerido.toFixed(2)}
          </p>
        </div>

        {/* Fluxo Financeiro Padronizado */}
        <div className="space-y-2 text-sm">

          {/* 1. Taxas Totais (Comissão) */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Taxas Totais:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{taxBreakdown}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-red-600 font-medium">
              - R$ {comissao.toFixed(2)}
            </span>
          </div>

          {/* 2. Receita Pós-Taxas */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Receita (Pós-Taxas):</span>
            <span className="font-medium text-gray-700">
              R$ {receitaPosTaxas.toFixed(2)}
            </span>
          </div>

          {/* 3. Custo de Envio (se houver) */}
          {custoEnvio > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Custo de Envio:</span>
              <span className="text-orange-600 font-medium">
                - R$ {custoEnvio.toFixed(2)}
              </span>
            </div>
          )}

          {/* 4. Repasse Líquido */}
          <div className="flex justify-between pt-2 border-t">
            <span className="text-gray-700 font-medium">Repasse Líquido:</span>
            <span className="text-blue-600 font-semibold">
              R$ {repasseLiquido.toFixed(2)}
            </span>
          </div>

          {/* Custo do Produto (referência) */}
          <div className="flex justify-between text-xs text-gray-400">
            <span>- Custo Produto:</span>
            <span>R$ {custoProduto.toFixed(2)}</span>
          </div>

          {/* 5. Lucro Líquido Final */}
          <div className="flex justify-between font-bold pt-2 border-t bg-green-50 -mx-4 px-4 py-2 rounded">
            <span>Lucro Líquido:</span>
            <span className="text-green-600">
              R$ {lucroLiquido.toFixed(2)}
            </span>
          </div>

          {/* Margem Real */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Margem Real:</span>
            <span>{margemReal.toFixed(1)}%</span>
          </div>
        </div>

        {/* Quantidade (se maior que 1) */}
        {result.quantity !== undefined && result.quantity > 1 && (
          <div className="mt-2 pt-2 border-t text-xs text-center text-gray-500">
            Total para {result.quantity} un: <br />
            <span className="font-semibold text-green-600">
              R$ {(lucroLiquido * result.quantity).toFixed(2)}
            </span> de lucro
          </div>
        )}

        {/* ML-specific badges */}
        {isMLResult && (
          <div className="mt-3 pt-3 border-t flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="text-xs">
              {result.adLevel === 'classico' ? 'Clássico' : 'Premium'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {result.shippingMode === 'padrao' ? 'Padrão' :
                result.shippingMode === 'full' ? 'Full' : 'Flex'}
            </Badge>
            {result.isFreteGratis === true && (
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                Frete Grátis
              </Badge>
            )}
            {typeof result.reembolsoFlex === 'number' && result.reembolsoFlex > 0 && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                +R$ {result.reembolsoFlex.toFixed(2)} Reembolso
              </Badge>
            )}
          </div>
        )}

        {/* Amazon-specific badges */}
        {isAmazonResult && (
          <div className="mt-3 pt-3 border-t flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
              {result.logisticMode === 'fbm' ? 'FBM' :
                result.logisticMode === 'fba' ? 'FBA' : 'DBA'}
            </Badge>
            {result.tierInfo && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                {result.tierInfo}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
