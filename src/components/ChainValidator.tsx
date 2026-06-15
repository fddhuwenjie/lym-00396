import { CheckCircle2, XCircle, Clock, Link, AlertTriangle, Play, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCertificateStore } from '@/store/certificateStore';
import { ChainStepResult } from '@/utils/chain';

function StepBadge({ valid, label }: { valid: boolean; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded',
        valid
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-red-500/15 text-red-400'
      )}
    >
      {valid ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {label}
    </span>
  );
}

function ChainStep({
  result,
  isLast,
}: {
  result: ChainStepResult;
  isLast: boolean;
}) {
  const allValid = result.signatureValid && result.nameChainValid && result.validityOk;

  return (
    <div className="relative pl-8 pb-6">
      {!isLast && (
        <div
          className={cn(
            'absolute left-3 top-8 bottom-0 w-0.5',
            allValid ? 'bg-emerald-500/30' : 'bg-red-500/30'
          )}
        />
      )}

      <div
        className={cn(
          'absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center border-2',
          allValid
            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
            : 'bg-red-500/20 border-red-500 text-red-400'
        )}
      >
        {allValid ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : (
          <XCircle className="w-3.5 h-3.5" />
        )}
      </div>

      <div
        className={cn(
          'rounded-lg border p-3 bg-zinc-900/50',
          allValid ? 'border-emerald-500/20' : 'border-red-500/20'
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate" title={result.subject}>
              {result.subject || 'Unknown'}
            </p>
            {result.selfSigned && (
              <span className="text-[10px] text-zinc-500">自签名根证书</span>
            )}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0">
            #{result.index + 1}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          <StepBadge valid={result.signatureValid} label="签名" />
          {!result.selfSigned && (
            <StepBadge valid={result.nameChainValid} label="名称链" />
          )}
          <StepBadge valid={result.validityOk} label="有效期" />
        </div>

        {result.signatureError && (
          <div className="text-xs text-red-400 bg-red-500/10 rounded p-2 mt-2">
            <div className="font-medium mb-0.5">签名错误:</div>
            <div className="font-mono text-[11px]">{result.signatureError}</div>
          </div>
        )}

        {result.validityError && (
          <div className="text-xs text-amber-400 bg-amber-500/10 rounded p-2 mt-2">
            <div className="font-medium mb-0.5">有效期错误:</div>
            <div className="text-[11px]">{result.validityError}</div>
          </div>
        )}

        {!result.nameChainValid && !result.selfSigned && (
          <div className="text-xs text-red-400 bg-red-500/10 rounded p-2 mt-2">
            颁发者与父证书主题不匹配
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChainValidator() {
  const {
    leafCert,
    intermediateCerts,
    rootCerts,
    chainResult,
    runChainValidation,
    isVerifying,
    error,
  } = useCertificateStore();

  const canValidate = leafCert && (intermediateCerts.length > 0 || rootCerts.length > 0);

  if (!leafCert) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <Link className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm">请先加载叶子证书</p>
        <p className="text-xs text-zinc-600 mt-1">再添加中间证书和根证书进行链验证</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          证书链验证
        </h3>

        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={runChainValidation}
            disabled={!canValidate || isVerifying}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
              canValidate && !isVerifying
                ? 'bg-emerald-500 text-zinc-900 hover:bg-emerald-400'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            )}
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isVerifying ? '验证中...' : '运行链验证'}
          </button>
        </div>

        {!canValidate && (
          <p className="text-xs text-amber-400/80 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            请添加中间证书或根证书以进行链验证
          </p>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md mt-2">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>

      {chainResult ? (
        <>
          <div
            className={cn(
              'p-3 rounded-lg border mb-4',
              chainResult.valid
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            )}
          >
            <div className="flex items-center gap-2">
              {chainResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  chainResult.valid ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {chainResult.valid ? '证书链验证通过' : '证书链验证失败'}
              </span>
              <span className="text-xs text-zinc-500 ml-auto">
                共 {chainResult.chain.length} 级证书
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto pr-2">
            {chainResult.results.map((result, i) => (
              <ChainStep
                key={i}
                result={result}
                isLast={i === chainResult.results.length - 1}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
          <Clock className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">点击上方按钮运行链验证</p>
        </div>
      )}
    </div>
  );
}
