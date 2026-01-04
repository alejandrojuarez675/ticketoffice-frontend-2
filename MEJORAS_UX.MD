Mejoras para pantallas adaptandolo a nuestro codigo, estas pantallas solo deben reacomodarse para tener la estetica y los efectos visuales, es decir el html y el css dentro de nuestro proyecto hecho con next.js , la funcionalidades de nuestro proyecto deben mantenerse igual y los colores iconicos de nuestro proyecto igual.

1. <!DOCTYPE html>

<html lang="es" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Evento - TuEntradaYa</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        /* Hide number input spinners */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    </style>
</head>
<body class="bg-[#0d1117] text-zinc-100 antialiased min-h-screen flex flex-col selection:bg-violet-500/30">

    <!-- Navbar -->
    <header class="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/5 bg-[#0d1117]">
        <div class="flex items-center gap-8">
            <!-- Brand -->
            <a href="#" class="flex items-center gap-2">
                <div class="px-2 py-1 bg-white text-black font-bold tracking-tighter text-sm rounded-sm">TUENTRADAYA</div>
            </a>

            <!-- Nav Links -->
            <nav class="hidden md:flex items-center gap-6">
                <a href="#" class="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Eventos</a>
            </nav>
        </div>

        <div class="flex items-center gap-4">
            <button class="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium rounded-full transition-all shadow-lg shadow-violet-500/20">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                Crear evento
            </button>
            <div class="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300 cursor-pointer hover:bg-zinc-600 transition-colors">
                S
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">

            <!-- Left Column: Event Details -->
            <div class="lg:col-span-8 space-y-8">

                <!-- Title -->
                <h1 class="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Concierto de Rock en Buenos Aires</h1>

                <!-- Hero Image -->
                <div class="relative w-full aspect-video rounded-xl overflow-hidden border border-white/5 bg-zinc-900 shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"
                         alt="Event cover" class="w-full h-full object-cover">
                    <!-- Overlay gradient for depth -->
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0d1117]/60 to-transparent"></div>
                </div>

                <!-- Description -->
                <section class="space-y-4 pt-4">
                    <h2 class="text-xl font-semibold text-white tracking-tight">Descripción</h2>
                    <div class="prose prose-invert prose-zinc max-w-none text-zinc-400 text-sm leading-relaxed">
                        <p>La descripción es obligatoria. Prepárate para una noche inolvidable con las mejores bandas de rock de la escena nacional e internacional. Este evento reunirá a miles de fanáticos en el mítico Estadio Monumental para vibrar al ritmo de guitarras distorsionadas y baterías potentes.</p>
                        <p class="mt-4">No te pierdas la oportunidad de ser parte de la historia. Habrá food trucks, merchandising exclusivo y sorpresas durante toda la jornada.</p>
                    </div>
                </section>

                <!-- Divider -->
                <div class="h-px bg-white/5 w-full"></div>

                <!-- Additional Info -->
                <section class="space-y-6">
                    <h2 class="text-xl font-semibold text-white tracking-tight">Información Adicional</h2>

                    <div class="space-y-6">
                        <!-- Date -->
                        <div class="flex items-start gap-4 group">
                            <div class="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center border border-white/5 group-hover:border-violet-500/30 transition-colors">
                                <i data-lucide="calendar" class="w-5 h-5 text-violet-400"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-zinc-200">Fecha y Hora</p>
                                <p class="text-sm text-zinc-500 mt-0.5">jueves, 13 de agosto de 2026, 05:00 a. m.</p>
                            </div>
                        </div>

                        <!-- Location -->
                        <div class="flex items-start gap-4 group">
                            <div class="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center border border-white/5 group-hover:border-violet-500/30 transition-colors">
                                <i data-lucide="map-pin" class="w-5 h-5 text-violet-400"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-zinc-200">Ubicación</p>
                                <p class="text-sm text-zinc-500 mt-0.5">Estadio Monumental</p>
                                <p class="text-sm text-zinc-500">Dirección completa del lugar, Rosario, Argentina</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Right Column: Purchase Card -->
            <div class="lg:col-span-4 space-y-4">

                <!-- Ticket Selector Card -->
                <div class="bg-[#1c1c22] border border-white/5 rounded-xl p-6 shadow-xl sticky top-8">
                    <h3 class="text-lg font-semibold text-white mb-4">Selecciona tu entrada</h3>

                    <!-- Ticket Type Selector -->
                    <div class="space-y-2 mb-6">
                        <label class="text-xs font-medium text-zinc-400">Tipo de entrada</label>
                        <div class="relative group cursor-pointer">
                            <div class="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg opacity-100 blur-[1px]"></div>
                            <div class="relative bg-[#1c1c22] rounded-lg p-3 flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-white">Entrada General</p>
                                    <p class="text-xs text-zinc-500 mt-0.5">78 entradas disponibles</p>
                                </div>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4ade80] text-black uppercase tracking-wide">
                                    Gratis
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-white/5 w-full my-6"></div>

                    <!-- Quantity -->
                    <div class="space-y-2 mb-6">
                        <label class="text-xs font-medium text-zinc-400">Cantidad</label>
                        <div class="flex items-center gap-3">
                            <button class="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                                <i data-lucide="minus" class="w-4 h-4"></i>
                            </button>
                            <input type="number" value="5" class="flex-1 bg-transparent text-center font-medium text-white focus:outline-none" readonly>
                            <button class="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                                <i data-lucide="plus" class="w-4 h-4"></i>
                            </button>
                        </div>
                        <p class="text-[10px] text-zinc-500 text-center">Máximo 78 por compra</p>
                    </div>

                    <!-- Summary -->
                    <div class="space-y-3 mb-6 text-sm">
                        <div class="flex justify-between items-center text-zinc-400">
                            <span>Precio por entrada:</span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4ade80] text-black uppercase tracking-wide">Gratis</span>
                        </div>
                        <div class="flex justify-between items-center text-zinc-400">
                            <span>Cantidad:</span>
                            <span>5</span>
                        </div>
                        <div class="h-px bg-white/5 w-full"></div>
                        <div class="flex justify-between items-center text-white font-medium text-base pt-1">
                            <span>Subtotal:</span>
                            <span>$ 0,00</span>
                        </div>
                    </div>

                    <!-- Primary Action -->
                    <button class="w-full py-3 bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:brightness-110 text-white font-medium rounded-lg shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2 mb-4">
                        <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                        Comprar ahora
                    </button>

                    <!-- Secondary Actions -->
                    <div class="grid grid-cols-2 gap-3">
                        <button class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 text-xs font-medium transition-colors">
                            <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
                            Compartir
                        </button>
                        <button class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 text-xs font-medium transition-colors">
                            <i data-lucide="calendar-plus" class="w-3.5 h-3.5"></i>
                            Agregar al calendario
                        </button>
                    </div>
                </div>

                <!-- Organizer Card -->
                <div class="bg-[#1c1c22] border border-white/5 rounded-xl p-6">
                    <h3 class="text-sm font-semibold text-zinc-200 mb-4">Organizador</h3>
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-xs font-bold text-zinc-300">

                        </div>
                        <div>
                            <p class="text-sm font-medium text-white">TuEntradaYa</p>
                            <a href="#" class="text-xs text-violet-400 hover:text-violet-300 transition-colors">Ver perfil</a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </main>

    <script>
        lucide.createIcons();
    </script>

</body>
</html>

</body></html>
