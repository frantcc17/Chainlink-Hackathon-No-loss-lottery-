# 🎟️ RWA No-Loss Lottery (MVP)

## 📖 Descripción del Proyecto
Este proyecto es un Producto Mínimo Viable (MVP) de una **Lotería sin Pérdida (No-Loss Lottery)** impulsada por Activos del Mundo Real (RWA). A diferencia de las loterías tradicionales donde los participantes gastan dinero al comprar un boleto, en este protocolo **los usuarios depositan fondos, conservan su capital inicial intacto al 100% y tienen la oportunidad de ganar premios semanales.**

Los premios se financian con los intereses generados por los depósitos colectivos. Para lograr esto, el protocolo se integra con **Ondo Finance (USDY)**, aprovechando los rendimientos de los Bonos del Tesoro de EE. UU. (T-Bills), y utiliza **Chainlink VRF** para garantizar que la selección de ganadores sea demostrablemente justa, transparente y 100% on-chain.

## ⚙️ ¿Cómo funciona? (Flujo Optimizado)
La arquitectura está diseñada para separar de forma segura el capital inicial (principal) de los intereses generados (yield):

1. **Depósito Seguro:** El usuario deposita USDC en el `PrizeVault` (un Vault que cumple con el estándar **ERC4626** de OpenZeppelin) y recibe participaciones (shares). El principal siempre está respaldado 1:1.
2. **Generación de Intereses:** El Vault transfiere automáticamente la liquidez a la `OndoStrategy`. Esta estrategia convierte los USDC a USDY (Ondo) para comenzar a acumular rendimiento de forma pasiva.
3. **Harvest Semanal:** Una vez a la semana, la estrategia calcula el crecimiento del valor. Protege estrictamente el capital inicial y liquida únicamente las ganancias, enviando el *yield* puro (en USDC) al motor de la lotería.
4. **Distribución Financiera (Splits):** El contrato `PrizePool` recibe los intereses y los divide automáticamente según las reglas del protocolo:
   - 🏆 **80%** se destina al pozo de premios del sorteo.
   - 🏛️ **10%** se envía a la Tesorería del protocolo.
   - 💧 **10%** se reserva para incentivar a los Proveedores de Liquidez (LPs).
5. **Sorteo Justo:** Se inicia el sorteo solicitando un número aleatorio a través de **Chainlink VRF v2**, seleccionando al azar a un ganador entre los depositantes activos.
6. **Reclamo (Pull Pattern):** El ganador utiliza la función `claimPrize` para retirar sus ganancias en USDC. En cualquier momento, cualquier usuario puede retirar sus fondos iniciales completos sin penalización.

## 🛠️ Arquitectura y Tecnologías
- **Entorno de Desarrollo:** [Foundry](https://book.getfoundry.sh/)
- **Lenguaje:** Solidity `^0.8.20`
- **Estándares:** ERC4626 (Tokenized Vaults), ERC20
- **Integraciones:** - Ondo Finance (USDY) para la generación de rendimiento (RWA).
  - Chainlink VRF V2 para la aleatoriedad descentralizada.
- **Librerías:** OpenZeppelin Contracts, Chainlink Brownie Contracts.

### 📄 Contratos Principales
- `PrizeVault.sol`: Bóveda principal de interacción con el usuario. Gestiona los depósitos, retiros y mantiene la contabilidad 1:1.
- `OndoStrategy.sol`: Adaptador DeFi que interactúa con oráculos y *swappers* para invertir en USDY, medir el crecimiento del portafolio y extraer el yield de forma segura.
- `PrizePool.sol`: Gestor del sorteo que divide los fondos entrantes, se comunica con Chainlink para elegir al ganador y custodia los premios a reclamar.
