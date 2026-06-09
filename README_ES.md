<p align="center">
  <a href="README.md">简体中文</a> · <a href="README_EN.md">English</a> · <a href="README_JA.md">日本語</a> · <a href="README_KO.md">한국어</a> · <a href="README_ES.md">Español</a>
</p>

# Private Board AI

> Tu sala de juntas privada para las decisiones difíciles.

Private Board AI convierte una pregunta personal o estratégica enredada en un debate estructurado de sala de juntas. En lugar de pedirle a una sola IA una única respuesta pulida, invitas a un panel de mentes agudas a desafiarse entre sí, discrepar, revisar y ayudarte a ver la decisión desde múltiples ángulos.

No es un adivino. No es un coach de vida. Es una sala para pensar.

## Por qué existe

La mayoría de las decisiones importantes no se bloquean por falta de consejo. Se bloquean por compensaciones poco claras.

¿Debería dejar mi trabajo? ¿Fundar una empresa? ¿Mudarme de país? ¿Tomar el camino más seguro? ¿Redoblar la apuesta por una idea arriesgada? ¿Elegir dinero, libertad, estatus, familia, curiosidad o la opcionalidad a largo plazo?

Private Board AI ayuda simulando el tipo de conversación que desearías poder tener antes de tomar la decisión:

- una persona argumenta desde la protección frente al riesgo a la baja
- otra empuja hacia la ambición y el apalancamiento
- otra pregunta a qué juego estás jugando realmente
- otra desafía el supuesto oculto
- y tú decides si la junta debe seguir debatiendo

## Qué hace

- **Selección de junta personalizada**: responde un perfil breve, haz una pregunta y DeepSeek recomienda una junta para tu situación.
- **Alineación ajustable**: conserva la junta recomendada, quita personas o elige tu propio panel.
- **Debate real de múltiples rondas**: la junta debate en rondas separadas, no en un monólogo falso.
- **Continuación con intervención humana**: tras dos rondas, decides si continúan. Tus comentarios pasan a formar parte de la siguiente ronda.
- **Modos en chino e inglés**: interfaz, prompts, ejemplos, nombres de los asesores y avisos legales localizados.
- **Persistencia local**: el perfil, la pregunta, la selección de la junta y el progreso del debate se guardan en el almacenamiento del navegador.
- **Trae tu propia clave de DeepSeek**: la app admite una clave de API proporcionada por el usuario que se almacena únicamente en el navegador.

## Cómo se siente

Pregunta:

> Estoy considerando dejar mi trabajo estable para crear un pequeño producto de IA. Tengo ahorros para 12 meses, pero mi familia espera que siga un camino predecible. ¿Qué debería hacer?

Private Board AI no se limita a responder. Convoca a una junta, deja que discutan y luego te pregunta:

> ¿Deberían continuar? ¿Qué deberían considerar a continuación?

Puedes añadir:

> Continúen, pero céntrense más en el riesgo a la baja y en lo que debería validar antes de renunciar.

La siguiente ronda de debate responde a ese contexto.

## Resumen

Private Board AI es un experimento de "junta directiva privada": completas un perfil de usuario ligero, planteas una duda real y el sistema recomienda un grupo de miembros de la junta adecuados para esa pregunta, dejándolos debatir en varias rondas en torno a tu pregunta.

No se trata de que la IA te diga directamente la respuesta, sino de ayudarte a descomponer una elección importante en compensaciones, riesgos, oportunidades y puntos ciegos más claros.

Adecuado para preguntas como:

- si cambiar de trabajo, emprender, cambiar de carrera o emigrar
- si tomar una decisión arriesgada pero con un techo alto
- cómo equilibrar entre dinero, libertad, familia, crecimiento y reputación
- si vale la pena seguir invirtiendo en una decisión de negocio, producto, carrera o vida

## Stack tecnológico

| Capa | Elección |
|---|---|
| Framework | Next.js 16 App Router + React 19 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| LLM | DeepSeek via OpenAI-compatible API |
| Modelo de selección | `deepseek-v4-flash` |
| Modelo de debate | `deepseek-v4-flash` |
| Streaming | Server-Sent Events |
| Almacenamiento | Browser `localStorage` + `sessionStorage` |
| Pruebas | Vitest |

## Primeros pasos

```bash
cp .env.local.example .env.local
```

Añade tu clave de API de DeepSeek:

```env
DEEPSEEK_API_KEY=sk-xxx
```

Instala las dependencias y ejecuta en local:

```bash
npm install
npm run dev
```

Abre:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev          # start local dev server
npm run build        # production build
npm run lint         # eslint
npm test             # run tests
npm run test:watch   # watch tests
```

## Privacidad y seguridad

- `.env.local` es ignorado por Git y nunca debe subirse al repositorio.
- Las claves de API proporcionadas por el usuario se almacenan en el navegador, no en el repositorio.
- Los miembros de la junta son simulaciones de IA basadas en ideas y estilos de escritura de cara al público.
- El debate generado es solo para la reflexión y el apoyo a la toma de decisiones. No es asesoramiento legal, médico, financiero ni profesional.

## Estado

Esta es una interfaz experimental de apoyo a la toma de decisiones. La experiencia central funciona:

- incorporación mediante perfil
- recomendación de la junta
- ajuste de la junta
- interfaz bilingüe
- debate real de múltiples rondas
- continuación guiada por el usuario
- estado del debate persistido
- integración con DeepSeek

## Para quién está hecho

Para quienes no quieren una única respuesta.

Para quienes quieren que sus supuestos sean desafiados antes de una decisión trascendental.

Para quienes piensan mejor cuando chocan perspectivas fuertes.
