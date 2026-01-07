import Image from 'next/image'

interface QuantityControlProps {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
}

export default function QuantityControl({ quantity, onIncrease, onDecrease }: QuantityControlProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onDecrease}
        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-secondary transition-colors"
      >
        <Image src="/images/Subtract Icon.svg" alt="decrease" width={16} height={16} />
      </button>
      <span className="text-xl font-semibold text-primary w-12 text-center">
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-secondary transition-colors"
      >
        <Image src="/images/Add Icon.svg" alt="increase" width={16} height={16} />
      </button>
    </div>
  )
}

