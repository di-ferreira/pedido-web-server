'use client';
import { iCliente } from '@/@types/Cliente';
import { iColumnType } from '@/@types/Table';
import { MaskCnpjCpf } from '@/lib/utils';
import { faBan, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const RenderIconBloqueado = (value: string): JSX.Element => {
  if (value === 'S')
    return <FontAwesomeIcon icon={faBan} className='text-red-700' size='xl' />;
  return (
    <FontAwesomeIcon icon={faCheck} className='text-green-800' size='xl' />
  );
};

// export const columns: ColumnDef<iCliente>[] = [
//   {
//     accessorKey: 'CLIENTE',
//     header: 'ID',
//   },
//   {
//     accessorKey: 'NOME',
//     header: 'NOME',
//   },
//   {
//     accessorKey: 'BLOQUEADO',
//     header: 'BLOQUEADO',
//     cell: ({ row }) => {
//       const valueRow = row.getValue('BLOQUEADO');
//       const formatted =
//         valueRow !== 'S' ? (
//           <FontAwesomeIcon icon={faBan} className='text-red-700' size='xl' />
//         ) : (
//           <FontAwesomeIcon
//             icon={faCheck}
//             className='text-green-800'
//             size='xl'
//           />
//         );

//       return <div className='text-center font-medium'>{formatted}</div>;
//     },
//   },
//   {
//     accessorKey: 'CIC',
//     header: 'CPF/CNPJ',
//   },
//   {
//     accessorKey: 'ENDERECO',
//     header: 'ENDEREÇO',
//   },
//   {
//     accessorKey: 'BAIRRO',
//     header: 'BAIRRO',
//   },
//   {
//     accessorKey: 'CIDADE',
//     header: 'CIDADE',
//   },
//   {
//     accessorKey: 'UF',
//     header: 'UF',
//   },
//   {
//     id: 'actions',
//     cell: ({ row }) => {
//       const cliente = row.original;

//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant='ghost' className='h-8 w-8 p-0'>
//               <span className='sr-only'>Open menu</span>
//               <MoreHorizontal className='h-4 w-4' />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align='end'>
//             <DropdownMenuLabel>Actions</DropdownMenuLabel>
//             <DropdownMenuItem
//               onClick={() =>
//                 navigator.clipboard.writeText(String(cliente.CLIENTE))
//               }
//             >
//               Copy Cliente ID
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem>View customer</DropdownMenuItem>
//             <DropdownMenuItem>View Cliente details</DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       );
//     },
//   },
// ];

export const headers: iColumnType<iCliente>[] = [
  {
    key: 'CLIENTE',
    title: 'ID',
    width: '10rem',
  },
  {
    key: 'NOME',
    title: 'NOME',
    width: '20rem',
  },
  {
    key: 'BLOQUEADO',
    title: 'BLOQUEADO',
    width: '11rem',
    isHideMobile: true,
    render: (_, item) =>
      item.BLOQUEADO && <>{RenderIconBloqueado(String(item.BLOQUEADO))}</>,
  },
  {
    key: 'CIC',
    title: 'CPF/CNPJ',
    width: '20rem',
    render: (_, item) => <>{MaskCnpjCpf(item.CIC)}</>,
  },
  {
    key: 'ENDERECO',
    title: 'ENDEREÇO',
    isHideMobile: true,
    width: '20rem',
  },
  {
    key: 'BAIRRO',
    title: 'BAIRRO',
    isHideMobile: true,
    width: '20rem',
  },
  {
    key: 'CIDADE',
    title: 'CIDADE',
    isHideMobile: true,
    width: '20rem',
  },
  {
    key: 'UF',
    title: 'UF',
    isHideMobile: true,
    width: '7rem',
  },
  // {
  //   key: 'acoes',
  //   title: 'AÇÕES',
  //   width: '20rem',
  //   action: [
  //     {
  //       onclick: handleOrcamento,
  //       Icon: faFileLines,
  //       Rounded: true,
  //       Title: 'Novo Orçamento',
  //       Type: 'success',
  //     },
  //     {
  //       onclick: handleCliente,
  //       Icon: faEdit,
  //       Rounded: true,
  //       Title: 'Editar',
  //       Type: 'warn',
  //     },
  //   ],
  // },
];

