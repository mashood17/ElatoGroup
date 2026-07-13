import type { MenuItem } from '../../../content/celebreContent'

function VegMark({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={`inline-flex h-3.5 w-3.5 items-center justify-center border ${
        isVeg ? 'border-success' : 'border-danger'
      }`}
      aria-hidden="true"
    >
      {isVeg ? (
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
      ) : (
        <span
          className="h-0 w-0 border-x-[3px] border-b-[5px] border-x-transparent border-b-danger"
        />
      )}
    </span>
  )
}

export function MenuItemRow({ item, onOpen }: { item: MenuItem; onOpen: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className="group flex w-full items-center justify-between gap-4 border-b border-primary-100 py-4 text-left last:border-b-0"
    >
      <span className="flex items-center gap-3">
        <VegMark isVeg={item.isVeg} />
        <span className="text-body text-secondary-900 underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-secondary-500">
          {item.name}
        </span>
        <span className="sr-only">{item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}</span>
      </span>
      <span className="flex items-center gap-3">
        <span className="text-body text-neutral-warm-500">₹{item.price}</span>
        <span
          className="flex h-6 w-6 items-center justify-center text-secondary-500 transition-transform duration-200 ease-out group-hover:rotate-45"
          aria-hidden="true"
        >
          +
        </span>
      </span>
    </button>
  )
}
