export interface Service {
  name: string;
  url: string;
  description?: string;
}

export const services: Service[] = [
  {
    name: 'API',
    url: 'https://api.reigreengroup.com',
    description: 'API principal de Reigreen Group'
  },
  {
    name: 'Clientes',
    url: 'https://clientes.reigreengroup.com',
    description: 'Portal de clientes'
  },
  {
    name: 'Web',
    url: 'https://reigreengroup.com',
    description: 'Sitio web principal'
  },
  {
    name: 'OCR',
    url: 'https://ocr.reigreengroup.com',
    description: 'Servicio de OCR'
  },
  {
    name: 'Magika',
    url: 'https://magika.reigreengroup.com',
    description: 'Servicio de Magika'
  }
];