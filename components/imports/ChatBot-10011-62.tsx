import svgPaths from "./svg-cr1okqcvbh";

function ArrowBack() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="arrow_back">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="arrow_back">
          <path d={svgPaths.p390123a0} fill="var(--fill-0, #212121)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[20px] relative shrink-0 w-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[39.5px] not-italic text-[14px] text-center text-nowrap text-white top-[0.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">Tout effacer</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white content-stretch flex h-[32px] items-center px-[13px] py-px relative rounded-[4px] shrink-0 w-[40px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#ebebeb] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <ArrowBack />
      <Text />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[4px] items-center leading-[20px] not-italic relative shrink-0 text-[#101828] text-[13px] text-nowrap tracking-[-0.3008px] whitespace-pre">
      <p className="[text-underline-position:from-font] decoration-solid relative shrink-0 underline">[Nom de l’intervention]</p>
      <p className="relative shrink-0">{`>`}</p>
      <p className="[text-underline-position:from-font] decoration-solid relative shrink-0 underline">{`[Nom de la colonne] `}</p>
    </div>
  );
}

function Breadcrumb() {
  return (
    <div className="bg-[#ebf7ff] relative shrink-0 w-full" data-name="Breadcrumb">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center px-[24px] py-[12px] relative w-full">
          <Button />
          <Frame />
        </div>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[220px] relative shrink-0 w-full" data-name="Paragraph">
      <div className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[0] left-0 not-italic text-[#101828] text-[14px] top-[0.5px] tracking-[-0.3008px] w-[332px]">
        <p className="leading-[20px] mb-0">{`Voici la règle de calcul qui m'a premise d'arriver à ce chiffre: [prompt chatGPT].`}</p>
        <p className="leading-[20px] mb-0">&nbsp;</p>
        <p className="leading-[20px] mb-0">{`Voici les sources qui ont été utilisées : `}</p>
        <ul className="list-disc">
          <li className="mb-0 ms-[21px]">
            <span className="leading-[20px]">[source 1]</span>
          </li>
          <li className="ms-[21px]">
            <span className="leading-[20px]">[source 2]</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">11:50</p>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-white h-[272px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[4px] items-start pb-px pt-[18px] px-[18px] relative size-full">
          <Paragraph />
          <Paragraph1 />
        </div>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="basis-0 bg-[#f5f5f0] grow min-h-px min-w-px relative shrink-0 w-[419px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pt-[24px] px-[24px] relative rounded-[inherit] size-full">
        <Container />
      </div>
    </div>
  );
}

function TextInput() {
  return (
    <div className="basis-0 grow h-[38px] min-h-px min-w-px relative rounded-[10px] shrink-0" data-name="Text Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[16px] py-[8px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[14px] text-[rgba(10,10,10,0.5)] text-nowrap tracking-[-0.3008px] whitespace-pre">Demandez une simulation...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p185227c0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2db0e900} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#6b9571] h-[38px] opacity-50 relative rounded-[10px] shrink-0 w-[48px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[38px] items-start relative shrink-0 w-full" data-name="Container">
      <TextInput />
      <Button1 />
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-white h-[30px] relative rounded-[4px] shrink-0 w-[125.523px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[63.5px] not-italic text-[12px] text-center text-neutral-950 text-nowrap top-[8px] translate-x-[-50%] whitespace-pre">Réduire les coûts</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-white h-[30px] relative rounded-[4px] shrink-0 w-[112.008px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[56px] not-italic text-[12px] text-center text-neutral-950 text-nowrap top-[8px] translate-x-[-50%] whitespace-pre">Conversion bio</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-white h-[30px] relative rounded-[4px] shrink-0 w-[97.555px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[49.5px] not-italic text-[12px] text-center text-neutral-950 text-nowrap top-[8px] translate-x-[-50%] whitespace-pre">Réduire GES</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[30px] items-start relative shrink-0 w-full" data-name="Container">
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-white h-[130px] relative shrink-0 w-[419px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start pb-0 pt-[26px] px-[24px] relative size-full">
        <Container2 />
        <Container3 />
      </div>
    </div>
  );
}

export default function ChatBot() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start pl-px pr-0 py-0 relative size-full" data-name="ChatBot">
      <div aria-hidden="true" className="absolute border-[0px_0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none shadow-[0px_25px_16px_-12px_rgba(180,180,180,0.25)]" />
      <Breadcrumb />
      <Container1 />
      <Container4 />
    </div>
  );
}