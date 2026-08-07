import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import UploadPanel from './UploadPanel';

// Sin window.electronAPI: el panel debe ofrecer la variante web (Web Serial).

describe('UploadPanel en modo web', () => {
  afterEach(() => { delete navigator.serial; });

  test('sin Web Serial explica que hace falta Chrome o la app de escritorio', () => {
    render(<UploadPanel code="int x;" />);
    expect(screen.getByText(/Puerto USB no disponible en este navegador/)).toBeInTheDocument();
  });

  test('los botones de verificar y subir están deshabilitados', () => {
    render(<UploadPanel code="int x;" />);
    expect(screen.getByRole('button', { name: /verificar/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /subir/i })).toBeDisabled();
  });

  test('con Web Serial ofrece detectar el puerto USB', async () => {
    navigator.serial = {
      requestPort: jest.fn().mockResolvedValue({ getInfo: () => ({ usbVendorId: 0x2341, usbProductId: 0x0043 }) }),
    };
    render(<UploadPanel code="int x;" />);
    const boton = screen.getByRole('button', { name: /detectar puerto usb/i });
    await act(async () => { fireEvent.click(boton); });
    expect(await screen.findByRole('button', { name: /Arduino \(USB Serial\)/ })).toBeInTheDocument();
  });

  test('un dispositivo genérico se identifica por VID:PID', async () => {
    navigator.serial = {
      requestPort: jest.fn().mockResolvedValue({ getInfo: () => ({ usbVendorId: 0x1a86, usbProductId: 0x7523 }) }),
    };
    render(<UploadPanel code="int x;" />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /detectar puerto usb/i })); });
    expect(await screen.findByRole('button', { name: /1a86:7523/ })).toBeInTheDocument();
  });

  test('un puerto sin identificadores usa la etiqueta genérica', async () => {
    navigator.serial = { requestPort: jest.fn().mockResolvedValue({ getInfo: () => ({}) }) };
    render(<UploadPanel code="int x;" />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /detectar puerto usb/i })); });
    expect(await screen.findByRole('button', { name: /Puerto Serie USB/ })).toBeInTheDocument();
  });

  test('un puerto sin getInfo tampoco rompe', async () => {
    navigator.serial = { requestPort: jest.fn().mockResolvedValue({}) };
    render(<UploadPanel code="int x;" />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /detectar puerto usb/i })); });
    expect(await screen.findByRole('button', { name: /Puerto Serie USB/ })).toBeInTheDocument();
  });

  test('si el usuario cancela el selector no muestra error', async () => {
    const cancel = Object.assign(new Error('cancelado'), { name: 'NotFoundError' });
    navigator.serial = { requestPort: jest.fn().mockRejectedValue(cancel) };
    render(<UploadPanel code="int x;" />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /detectar puerto usb/i })); });
    expect(screen.queryByText(/Error al detectar puerto/)).not.toBeInTheDocument();
  });

  test('otros errores del selector sí se muestran', async () => {
    navigator.serial = { requestPort: jest.fn().mockRejectedValue(new Error('fallo del driver')) };
    render(<UploadPanel code="int x;" />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /detectar puerto usb/i })); });
    expect(await screen.findByText(/fallo del driver/)).toBeInTheDocument();
  });

  test('el modo plano se renderiza sin Paper', async () => {
    const { container } = render(<UploadPanel code="int x;" flat />);
    await waitFor(() => expect(screen.getByText(/Conexión y Subida/)).toBeInTheDocument());
    expect(container.querySelector('.MuiPaper-root')).toBeNull();
  });
});
