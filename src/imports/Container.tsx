function Heading() {
  return (
    <div className="content-stretch flex font-['Inter:Medium',sans-serif] font-medium items-center justify-between leading-[20px] not-italic relative shrink-0 text-[14px] text-nowrap tracking-[-0.1504px] w-full whitespace-pre" data-name="Heading 3">
      <p className="relative shrink-0 text-neutral-950">Propriétés du sol</p>
      <p className="[text-underline-position:from-font] decoration-solid relative shrink-0 text-[#4a6ad4] text-center underline">Modifier</p>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-gray-50 relative size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-px pt-[8px] px-[16px] relative size-full">
          <Heading />
        </div>
      </div>
    </div>
  );
}