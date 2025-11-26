export default function ProductCard({
  product,
  onClick,
}: {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  onClick: (productId: string) => void;
}) {
  return (
    <div
      className="p-4 h-[212px] w-[187px] overflow-hidden bg-gray-accent flex flex-col gap-2 rounded-lg cursor-pointer hover:bg-[#e4e4e4] transition-[.2s]"
      onClick={() => onClick(product.id)}
    >
      <img src={product.image} alt={product.name} className="w-20 h-20 object-contain rounded-md" />
      <span className="text-base leading-[20px] pb-2 line-clamp-3">{product.name}</span>
      <span className="w-full text-right text-md font-semibold font-inter mt-auto tracking-[1px]">
        {product.price.toFixed(2)} ₴
      </span>
    </div>
  );
}
