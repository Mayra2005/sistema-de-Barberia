package simulacion1;


import java.util.*;
import java.util.List;
import java.util.regex.*;
import java.io.*;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class Compilador {
    
    // ==========================================
    // CLASES INTERNAS
    // ==========================================
    
    static class Token {
        String lexema;
        String numToken;
        String tipo;
        int linea;
        
        public Token(String lexema, String numToken, String tipo, int linea) {
            this.lexema = lexema;
            this.numToken = numToken;
            this.tipo = tipo;
            this.linea = linea;
        }
        
        @Override
        public String toString() {
            return String.format("Token: %-15s N°: %-5s Tipo: %-25s Línea: %d", 
                               lexema, numToken, tipo, linea);
        }
    }
    
    static class NodoAST {
        String tipo;
        String valor;
        List<NodoAST> hijos;
        
        public NodoAST(String tipo, String valor) {
            this.tipo = tipo;
            this.valor = valor;
            this.hijos = new ArrayList<>();
        }
        
        public void agregarHijo(NodoAST hijo) {
            hijos.add(hijo);
        }
        
        @Override
        public String toString() {
            return String.format("%s(%s)", tipo, valor != null ? valor : "");
        }
        
        public void imprimir(StringBuilder sb, int nivel) {
            for (int i = 0; i < nivel; i++) {
                sb.append("  ");
            }
            sb.append(this.toString()).append("\n");
            
            for (NodoAST hijo : hijos) {
                hijo.imprimir(sb, nivel + 1);
            }
        }
    }
    
    // ==========================================
    // ENTRADA DE TABLA DE SÍMBOLOS
    // ==========================================
    
    static class EntradaTS {
        String id;        // ID del símbolo (&I, &J, %or1, etc.)
        String tk;        // Token (-51, -52, etc.)
        String valor;     // Valor (0, 0100, etc.)
        String d1;        // Dirección 1
        String d2;        // Dirección 2
        String ptr;       // Puntero (null o número de entrada)
        String ambito;    // Ámbito (@prueba, @pueba, etc.)
        int numero;       // Número de entrada (para referencias internas)
        int linea;        // Línea donde se declaró
        
        public EntradaTS(int numero, String id, String tk, String valor, 
                        String d1, String d2, String ptr, String ambito, int linea) {
            this.numero = numero;
            this.id = id;
            this.tk = tk;
            this.valor = valor;
            this.d1 = d1;
            this.d2 = d2;
            this.ptr = ptr;
            this.ambito = ambito;
            this.linea = linea;
        }
        
        public EntradaTS(int numero, String id, String tk, String valor, String ambito, int linea) {
            this.numero = numero;
            this.id = id;
            this.tk = tk;
            this.valor = valor;
            this.d1 = "0";
            this.d2 = "0";
            this.ptr = "null";
            this.ambito = ambito;
            this.linea = linea;
        }
        
        public String[] toArraySimbolos() {
            return new String[]{id, tk, valor, d1, d2, ptr, ambito};
        }
        
        @Override
        public String toString() {
            return String.format("%-15s %-8s %-8s %-8s %-8s %-8s %-15s",
                id, tk, valor, d1, d2, ptr, ambito);
        }
    }
    
    // ==========================================
    // ENTRADA DE TABLA DE DIRECCIONES
    // ==========================================
    
    static class EntradaDireccion {
        String id;        // ID del método/clase (@Find, @soypar, etc.)
        String tk;        // Token
        String numLin;    // Número de línea (#lin)
        String vci;       // VCI (Índice de Código Virtual)
        
        public EntradaDireccion(String id, String tk, String numLin, String vci) {
            this.id = id;
            this.tk = tk;
            this.numLin = numLin;
            this.vci = vci;
        }
        
        public String[] toArray() {
            return new String[]{id, tk, numLin, vci};
        }
    }
    
    // ==========================================
    // TABLA DE SÍMBOLOS
    // ==========================================
    
    static class TablaSimbolos {
        private List<EntradaTS> entradas;
        private int contador;
        private Stack<String> pilaAmbitos;
        private Map<String, Integer> offsetsMemoria;
        private Map<String, List<Integer>> entradasPorAmbito1;
		private Map<String, Integer> entradasPorAmbito;
        
        public TablaSimbolos() {
            this.entradas = new ArrayList<>();
            this.contador = 0;
            this.pilaAmbitos = new Stack<>();
            this.offsetsMemoria = new HashMap<>();
            this.entradasPorAmbito1 = new LinkedHashMap<>();
            
            this.pilaAmbitos.push("@global");
            this.offsetsMemoria.put("@global", 0);
            this.entradasPorAmbito1.put("@global", new ArrayList<>());
        }
        
        public String getAmbitoActual() {
            return pilaAmbitos.peek();
        }
        
        public void entrarAmbito(String nombreAmbito) {
            if (!nombreAmbito.startsWith("@")) {
                nombreAmbito = "@" + nombreAmbito;
            }
            pilaAmbitos.push(nombreAmbito);
            offsetsMemoria.put(nombreAmbito, 0);
            entradasPorAmbito1.put(nombreAmbito, new ArrayList<>());
        }
        
        public void salirAmbito() {
            if (pilaAmbitos.size() > 1) {
                pilaAmbitos.pop();
            }
        }
        
        public EntradaTS agregarVariable(String id, String tipo, int linea) {
            String ambito = getAmbitoActual();
            
            if (buscarEnAmbito(id, ambito) != null) {
                return null;
            }
            
            contador++;
            String tk = obtenerTokenPorTipo(tipo);
            String valor = "0";
            
            int offset = offsetsMemoria.getOrDefault(ambito, 0);
            int tamano = obtenerTamano(tipo);
            String d1 = "0"; // Modificado a 0 por petición del usuario
            
            EntradaTS entrada = new EntradaTS(contador, id, tk, valor, d1, "0", "null", ambito, linea);
            
            offsetsMemoria.put(ambito, offset + tamano);
            
            entradas.add(entrada);
            entradasPorAmbito1.get(ambito).add(contador);
            
            return entrada;
        }
        
        public EntradaTS agregarAmbito(String id, String tipo, int linea) {
            String ambitoPadre = getAmbitoActual();
            
            if (buscarEnAmbito(id, ambitoPadre) != null) {
                return null;
            }
            
            contador++;
            String tk = obtenerTokenPorTipo(tipo);
            String valor = "0";
            String d1 = "0";
            String ptr = "null";
            
            if (!ambitoPadre.equals("@global")) {
                EntradaTS padre = buscarAmbitoPadre(ambitoPadre);
                if (padre != null) {
                    ptr = String.valueOf(padre.numero);
                }
            }
            
            EntradaTS entrada = new EntradaTS(contador, id, tk, valor, d1, "0", ptr, ambitoPadre, linea);
            
            entradas.add(entrada);
            entradasPorAmbito1.get(ambitoPadre).add(contador);
            
            entrarAmbito(id);
            
            return entrada;
        }
        
        public EntradaTS buscarEnAmbito(String id, String ambito) {
            List<Integer> nums = entradasPorAmbito1.get(ambito);
            if (nums != null) {
                for (int num : nums) {
                    EntradaTS entrada = getEntradaPorNumero(num);
                    if (entrada != null && entrada.id.equals(id)) {
                        return entrada;
                    }
                }
            }
            return null;
        }
        
        public EntradaTS buscarSimbolo(String id) {
            for (int i = pilaAmbitos.size() - 1; i >= 0; i--) {
                String ambito = pilaAmbitos.get(i);
                EntradaTS entrada = buscarEnAmbito(id, ambito);
                if (entrada != null) {
                    return entrada;
                }
            }
            return null;
        }
        
        private EntradaTS buscarAmbitoPadre(String nombreAmbito) {
            for (EntradaTS entrada : entradas) {
                if (entrada.id.equals(nombreAmbito) && 
                    (entrada.valor.equals("clase") || entrada.valor.equals("metodo"))) {
                    return entrada;
                }
            }
            return null;
        }
        
        public EntradaTS getEntradaPorNumero(int numero) {
            for (EntradaTS entrada : entradas) {
                if (entrada.numero == numero) {
                    return entrada;
                }
            }
            return null;
        }
        
        public void actualizarValor(String id, String nuevoValor) {
            EntradaTS entrada = buscarSimbolo(id);
            if (entrada != null) {
                entrada.valor = nuevoValor;
            }
        }
        
        public List<EntradaTS> getTodasEntradas() {
            List<EntradaTS> ordenadas = new ArrayList<>(entradas);
            ordenadas.sort((e1, e2) -> Integer.compare(e1.numero, e2.numero));
            return ordenadas;
        }
        
        // Obtener solo métodos y clases (para tabla de direcciones)
        public List<EntradaTS> getEntidades() {
            List<EntradaTS> entidades = new ArrayList<>();
            for (EntradaTS entrada : entradas) {
                if (entrada.tk.equals("-1") || entrada.tk.equals("-16") || 
                    entrada.tk.equals("-21")) {
                    entidades.add(entrada);
                }
            }
            entidades.sort((e1, e2) -> Integer.compare(e1.numero, e2.numero));
            return entidades;
        }
        
        private String obtenerTokenPorTipo(String tipo) {
            switch (tipo.toLowerCase()) {
                case "entero": return "-23";
                case "real": return "-24";
                case "cadena": return "-22";
                case "clase": return "-21";
                case "metodo": return "-21";
                case "clase/metodo": return "-21";
                default: return "-21";
            }
        }
        
        private int obtenerTamano(String tipo) {
            switch (tipo.toLowerCase()) {
                case "entero": return 4;
                case "real": return 8;
                case "cadena": return 8;
                case "vacio": return 0;
                default: return 4;
            }
        }
        
        public String mostrarTabla() {
            StringBuilder sb = new StringBuilder();
            sb.append("\n╔══════════════════════════════════════════════════════════════════════════════╗\n");
            sb.append("║                           TABLA DE SÍMBOLOS                                  ║\n");
            sb.append("╠══════════════════╦══════════╦══════════╦══════════╦══════════╦══════════╦══════════════╣\n");
            sb.append(String.format("║ %-16s ║ %-8s ║ %-8s ║ %-8s ║ %-8s ║ %-8s ║ %-12s ║\n", 
                     "ID", "TK", "VALOR", "D1", "D2", "PTR", "AMBITO"));
            sb.append("╠══════════════════╬══════════╬══════════╬══════════╬══════════╬══════════╬══════════════╣\n");
            
            for (EntradaTS entrada : getTodasEntradas()) {
                sb.append(String.format("║ %-16s ║ %-8s ║ %-8s ║ %-8s ║ %-8s ║ %-8s ║ %-12s ║\n",
                    entrada.id, entrada.tk, entrada.valor, 
                    entrada.d1, entrada.d2, entrada.ptr, entrada.ambito));
            }
            
            sb.append("╚══════════════════╩══════════╩══════════╩══════════╩══════════╩══════════╩══════════════╝\n");
            
            return sb.toString();
        }
        
        public String getEstadisticas() {
            StringBuilder sb = new StringBuilder();
            sb.append("Total de símbolos: ").append(contador).append("\n");
            sb.append("Ámbitos creados: ").append(entradasPorAmbito1.size()).append("\n");
            return sb.toString();
        }
    }
    
    // ==========================================
    // TABLA DE DIRECCIONES
    // ==========================================
    
    static class TablaDirecciones {
        private List<EntradaDireccion> entradas;
        private int contadorVCI;
        
        public TablaDirecciones() {
            this.entradas = new ArrayList<>();
            this.contadorVCI = 0;
        }
        
        public void agregarEntrada(String id, String tk, String numLin, String tipoEstructura) {
            String vci = String.valueOf(contadorVCI);
            EntradaDireccion entrada = new EntradaDireccion(id, tk, numLin, vci);
            entradas.add(entrada);
            
            // Incrementar VCI según el tipo de entidad
            // Las clases no incrementan mucho, los métodos sí
            if (tipoEstructura.equals("metodo")) {
                contadorVCI += 10; // Los métodos ocupan más espacio de código
            } else {
                contadorVCI += 1;
            }
        }
        
        public List<EntradaDireccion> getEntradas() {
            return entradas;
        }
        
        public String mostrarTabla() {
            StringBuilder sb = new StringBuilder();
            sb.append("\n╔════════════════════════════════════════════════════════════════╗\n");
            sb.append("║                    TABLA DE DIRECCIONES                        ║\n");
            sb.append("╠══════════════════╦══════════╦══════════════╦══════════════════╣\n");
            sb.append(String.format("║ %-16s ║ %-8s ║ %-12s ║ %-16s ║\n", 
                     "ID", "TK", "#LIN", "VCI"));
            sb.append("╠══════════════════╬══════════╬══════════════╬══════════════════╣\n");
            
            for (EntradaDireccion entrada : entradas) {
                sb.append(String.format("║ %-16s ║ %-8s ║ %-12s ║ %-16s ║\n",
                    entrada.id, entrada.tk, entrada.numLin, entrada.vci));
            }
            
            sb.append("╚══════════════════╩══════════╩══════════════╩══════════════════╝\n");
            
            return sb.toString();
        }
    }
    
    // ==========================================
    // VARIABLES DEL COMPILADOR
    // ==========================================
    
    private List<Token> tokens;
    private Map<String, String[]> tablaSimbolosLexico;
    private TablaSimbolos tablaSimbolos;
    private TablaDirecciones tablaDirecciones;
    private int posicionActual;
    private Token tokenActual;
    private List<String> errores;
    private List<String> advertencias;
    
    // ==========================================
    // CONSTRUCTOR
    // ==========================================
    
    public Compilador() {
        tokens = new ArrayList<>();
        tablaSimbolosLexico = new LinkedHashMap<>();
        tablaSimbolos = new TablaSimbolos();
        tablaDirecciones = new TablaDirecciones();
        errores = new ArrayList<>();
        advertencias = new ArrayList<>();
        inicializarTablaSimbolosLexico();
    }
    
    // ==========================================
    // INICIALIZACIÓN TABLA DE SÍMBOLOS LÉXICO
    // ==========================================
    
    private void inicializarTablaSimbolosLexico() {
        // Palabras reservadas
        tablaSimbolosLexico.put("clase", new String[]{"-1", "Palabra reservada"});
        tablaSimbolosLexico.put("leer", new String[]{"-2", "Palabra reservada"});
        tablaSimbolosLexico.put("switch", new String[]{"-3", "Palabra reservada"});
        tablaSimbolosLexico.put("posxy", new String[]{"-4", "Palabra reservada"});
        tablaSimbolosLexico.put("entero", new String[]{"-5", "Palabra reservada"});
        tablaSimbolosLexico.put("int", new String[]{"-5", "Palabra reservada"});
        tablaSimbolosLexico.put("var", new String[]{"-6", "Palabra reservada"});
        tablaSimbolosLexico.put("escribir", new String[]{"-7", "Palabra reservada"});
        tablaSimbolosLexico.put("encaso", new String[]{"-8", "Palabra reservada"});
        tablaSimbolosLexico.put("limpiar", new String[]{"-9", "Palabra reservada"});
        tablaSimbolosLexico.put("real", new String[]{"-10", "Palabra reservada"});
        tablaSimbolosLexico.put("vacio", new String[]{"-11", "Palabra reservada"});
        tablaSimbolosLexico.put("si", new String[]{"-12", "Palabra reservada"});
        tablaSimbolosLexico.put("repite", new String[]{"-13", "Palabra reservada"});
        tablaSimbolosLexico.put("ejecutar", new String[]{"-14", "Palabra reservada"});
        tablaSimbolosLexico.put("regresar", new String[]{"-15", "Palabra reservada"});
        tablaSimbolosLexico.put("metodo", new String[]{"-16", "Palabra reservada"});
        tablaSimbolosLexico.put("sino", new String[]{"-17", "Palabra reservada"});
        tablaSimbolosLexico.put("mientras", new String[]{"-18", "Palabra reservada"});
        tablaSimbolosLexico.put("cadena", new String[]{"-19", "Palabra reservada"});
        tablaSimbolosLexico.put("salir", new String[]{"-20", "Palabra reservada"});
        
        // Operadores aritméticos
        tablaSimbolosLexico.put("+", new String[]{"-51", "Operador aritmético"});
        tablaSimbolosLexico.put("-", new String[]{"-52", "Operador aritmético"});
        tablaSimbolosLexico.put("*", new String[]{"-53", "Operador aritmético"});
        tablaSimbolosLexico.put("/", new String[]{"-54", "Operador aritmético"});
        tablaSimbolosLexico.put("%", new String[]{"-55", "Operador aritmético"});
        tablaSimbolosLexico.put("=", new String[]{"-56", "Operador aritmético"});
        tablaSimbolosLexico.put("++", new String[]{"-57", "Operador aritmético"});
        tablaSimbolosLexico.put("--", new String[]{"-58", "Operador aritmético"});
        tablaSimbolosLexico.put("+=", new String[]{"-59", "Operador aritmético"});
        tablaSimbolosLexico.put("-=", new String[]{"-60", "Operador aritmético"});
        tablaSimbolosLexico.put("/=", new String[]{"-61", "Operador aritmético"});
        tablaSimbolosLexico.put("*=", new String[]{"-62", "Operador aritmético"});
        
        // Operadores relacionales
        tablaSimbolosLexico.put("<", new String[]{"-71", "Operador relacional"});
        tablaSimbolosLexico.put("<=", new String[]{"-72", "Operador relacional"});
        tablaSimbolosLexico.put("!=", new String[]{"-73", "Operador relacional"});
        tablaSimbolosLexico.put(">", new String[]{"-74", "Operador relacional"});
        tablaSimbolosLexico.put(">=", new String[]{"-75", "Operador relacional"});
        tablaSimbolosLexico.put("==", new String[]{"-76", "Operador relacional"});
        
        // Operadores lógicos
        tablaSimbolosLexico.put("!", new String[]{"-81", "Operador lógico"});
        tablaSimbolosLexico.put("&&", new String[]{"-82", "Operador lógico"});
        tablaSimbolosLexico.put("||", new String[]{"-83", "Operador lógico"});
        
        // Caracteres especiales
        tablaSimbolosLexico.put(";", new String[]{"-91", "Carácter especial"});
        tablaSimbolosLexico.put("[", new String[]{"-92", "Carácter especial"});
        tablaSimbolosLexico.put("]", new String[]{"-93", "Carácter especial"});
        tablaSimbolosLexico.put(",", new String[]{"-94", "Carácter especial"});
        tablaSimbolosLexico.put(":", new String[]{"-95", "Carácter especial"});
        tablaSimbolosLexico.put("(", new String[]{"-96", "Carácter especial"});
        tablaSimbolosLexico.put(")", new String[]{"-97", "Carácter especial"});
        tablaSimbolosLexico.put("{", new String[]{"-98", "Carácter especial"});
        tablaSimbolosLexico.put("}", new String[]{"-99", "Carácter especial"});
    }
    
    // ==========================================
    // ANÁLISIS LÉXICO
    // ==========================================
    
    public List<Token> analizarLexico(String rutaArchivo) {
        tokens.clear();
        
        String palabrasReservadasPattern = "\\b(clase|leer|switch|posxy|entero|int|var|escribir|" +
            "encaso|limpiar|real|vacio|si|repite|ejecutar|regresar|metodo|sino|mientras|cadena|salir)\\b";
        
        String patronIdentificadorClaseMetodo = "@[a-zA-Z0-9]{1,7}";
        String patronIdentificadorString = "\\$[a-zA-Z0-9]{1,7}";
        String patronIdentificadorEntero = "&[a-zA-Z0-9]{1,7}";
        String patronIdentificadorReal = "%[a-zA-Z0-9]{1,7}";
        
        String patronIdentificador = patronIdentificadorClaseMetodo + "|" + 
                                    patronIdentificadorString + "|" + 
                                    patronIdentificadorEntero + "|" + 
                                    patronIdentificadorReal;
        
        String patronConstanteEntera = "[+-]?\\b(3276[0-8]|327[0-5][0-9]|32[0-6][0-9]{2}|3[0-1][0-9]{3}|[1-2][0-9]{1,4}|[0-9]{1,4})\\b";
        String patronConstanteReal = "[+-]?((\\d+\\.\\d+)|(\\.\\d+))";
        String patronConstanteString = "\"[^\"]*\"";
        String patronOperadores = "\\+\\+|--|\\+=|-=|/=|\\*=|&&|\\|\\||!=|>=|<=|==|[+\\-*/%=<>!]";
        String patronCaracteresEspeciales = "[;\\[\\],:(){}]";
        
        Pattern pattern = Pattern.compile(
            palabrasReservadasPattern + "|" +
            patronConstanteReal + "|" +
            patronConstanteEntera + "|" +
            patronConstanteString + "|" +
            patronIdentificador + "|" +
            patronOperadores + "|" +
            patronCaracteresEspeciales
        );
        
        try (BufferedReader br = new BufferedReader(new FileReader(rutaArchivo))) {
            String linea;
            int numLinea = 1;
            
            while ((linea = br.readLine()) != null) {
                int indiceComentario = linea.indexOf("//");
                if (indiceComentario != -1) {
                    linea = linea.substring(0, indiceComentario);
                }
                
                if (linea.trim().isEmpty()) {
                    numLinea++;
                    continue;
                }
                
                Matcher matcher = pattern.matcher(linea);
                
                while (matcher.find()) {
                    String lexema = matcher.group();
                    String numToken = "";
                    String tipo = "";
                    
                    if (tablaSimbolosLexico.containsKey(lexema)) {
                        numToken = tablaSimbolosLexico.get(lexema)[0];
                        tipo = tablaSimbolosLexico.get(lexema)[1];
                    }
                    else if (lexema.matches(patronConstanteReal)) {
                        numToken = "-41";
                        tipo = "Constante real";
                    }
                    else if (lexema.matches(patronConstanteEntera)) {
                        numToken = "-42";
                        tipo = "Constante entera";
                    }
                    else if (lexema.matches(patronConstanteString)) {
                        numToken = "-43";
                        tipo = "Constante string";
                    }
                    else if (lexema.matches(patronIdentificadorClaseMetodo)) {
                        numToken = "-21";
                        tipo = "Identificador (Clase/Método)";
                    }
                    else if (lexema.matches(patronIdentificadorString)) {
                        numToken = "-22";
                        tipo = "Identificador (String)";
                    }
                    else if (lexema.matches(patronIdentificadorEntero)) {
                        numToken = "-23";
                        tipo = "Identificador (Entero)";
                    }
                    else if (lexema.matches(patronIdentificadorReal)) {
                        numToken = "-24";
                        tipo = "Identificador (Real)";
                    }
                    else {
                        numToken = "??";
                        tipo = "Desconocido";
                    }
                    
                    tokens.add(new Token(lexema, numToken, tipo, numLinea));
                }
                numLinea++;
            }
        } catch (IOException e) {
            errores.add("Error al leer archivo: " + e.getMessage());
        }
        
        return tokens;
    }
    
    // ==========================================
    // ANÁLISIS SINTÁCTICO Y SEMÁNTICO
    // ==========================================
    
    private void avanzarToken() {
        if (posicionActual < tokens.size()) {
            tokenActual = tokens.get(posicionActual++);
        } else {
            tokenActual = null;
        }
    }
    
    private void errorSintactico(String mensaje) {
        String linea = tokenActual != null ? String.valueOf(tokenActual.linea) : "EOF";
        String lexema = tokenActual != null ? tokenActual.lexema : "EOF";
        errores.add(String.format("Error sintáctico [Línea %s]: %s. Token: '%s'", 
                  linea, mensaje, lexema));
    }
    
    private void errorSemantico(String mensaje, Token token) {
        errores.add(String.format("Error semántico [Línea %d]: %s. Token: '%s'", 
                  token.linea, mensaje, token.lexema));
    }
    
    private void advertencia(String mensaje, Token token) {
        advertencias.add(String.format("Advertencia [Línea %d]: %s. Token: '%s'", 
                      token.linea, mensaje, token.lexema));
    }
    
    private boolean verificarLexema(String lexema) {
        return tokenActual != null && tokenActual.lexema.equals(lexema);
    }
    
    private void consumir(String lexemaEsperado) {
        if (tokenActual != null && tokenActual.lexema.equals(lexemaEsperado)) {
            avanzarToken();
        } else {
            String encontrado = tokenActual != null ? tokenActual.lexema : "EOF";
            errorSintactico("Se esperaba '" + lexemaEsperado + "', se encontró '" + encontrado + "'");
            while (tokenActual != null && !verificarLexema(";") && !verificarLexema("}")) {
                avanzarToken();
            }
        }
    }
    
    private boolean esIdentificador(String lexema) {
        return lexema.startsWith("@") || lexema.startsWith("$") || 
               lexema.startsWith("&") || lexema.startsWith("%");
    }
    
    private boolean esConstante(String tipo) {
        return tipo.startsWith("Constante");
    }
    
    private String obtenerTipoPorPrefijo(String id) {
        if (id.startsWith("&")) return "entero";
        if (id.startsWith("%")) return "real";
        if (id.startsWith("$")) return "cadena";
        if (id.startsWith("@")) return "clase/metodo";
        return "desconocido";
    }
    
    // ==========================================
    // REGLAS GRAMATICALES
    // ==========================================
    
    public NodoAST analizarPrograma() {
        posicionActual = 0;
        errores.clear();
        advertencias.clear();
        tablaSimbolos = new TablaSimbolos();
        tablaDirecciones = new TablaDirecciones();
        
        if (tokens.isEmpty()) {
            errores.add("No hay tokens para analizar");
            return null;
        }
        
        avanzarToken();
        
        NodoAST programa = new NodoAST("PROGRAMA", "");
        
        try {
            programa.agregarHijo(analizarClase());
            
            if (tokenActual != null) {
                errorSintactico("Tokens inesperados después del final del programa");
            }
        } catch (Exception e) {
            errores.add("Error fatal en el análisis: " + e.getMessage());
            e.printStackTrace();
        }
        
        return programa;
    }
    
    // CLASE -> clase @id { DECLARACIONES METODOS }
    private NodoAST analizarClase() {
        NodoAST clase = new NodoAST("CLASE", "");
        
        if (verificarLexema("clase")) {
            consumir("clase");
            
            if (tokenActual != null && tokenActual.lexema.startsWith("@")) {
                String nombreClase = tokenActual.lexema;
                Token tokenClase = tokenActual;
                clase.valor = nombreClase;
                
                // AGREGAR A TABLA DE SÍMBOLOS
                EntradaTS entradaClase = tablaSimbolos.agregarAmbito(nombreClase, "clase", tokenClase.linea);
                if (entradaClase == null) {
                    errorSemantico("La clase '" + nombreClase + "' ya está declarada", tokenClase);
                } else {
                    // AGREGAR A TABLA DE DIRECCIONES
                    tablaDirecciones.agregarEntrada(nombreClase, "-21", String.valueOf(tokenClase.linea), "clase");
                }
                
                avanzarToken();
                consumir("{");
                
                clase.agregarHijo(analizarDeclaraciones());
                clase.agregarHijo(analizarMetodos());
                
                consumir("}");
                tablaSimbolos.salirAmbito();
            } else {
                errorSintactico("Se esperaba un identificador de clase (@nombre)");
            }
        } else {
            errorSintactico("Se esperaba 'clase' al inicio del programa");
        }
        
        return clase;
    }
    
    // DECLARACIONES -> DECLARACION DECLARACIONES | ε
    private NodoAST analizarDeclaraciones() {
        NodoAST declaraciones = new NodoAST("DECLARACIONES", "");
        
        while (tokenActual != null && verificarLexema("var")) {
            declaraciones.agregarHijo(analizarDeclaracion());
        }
        
        return declaraciones;
    }
    
    // DECLARACION -> var IDENTIFICADORES ;
    private NodoAST analizarDeclaracion() {
        NodoAST declaracion = new NodoAST("DECLARACION", "");
        
        if (verificarLexema("var")) {
            consumir("var");
            
            if (tokenActual != null && esIdentificador(tokenActual.lexema)) {
                Token tokenId = tokenActual;
                String identificador = tokenActual.lexema;
                
                String tipo = obtenerTipoPorPrefijo(identificador);
                declaracion.valor = tipo;
                
                // AGREGAR VARIABLE A TABLA DE SÍMBOLOS
                EntradaTS entrada = tablaSimbolos.agregarVariable(identificador, tipo, tokenId.linea);
                if (entrada == null) {
                    errorSemantico("La variable '" + identificador + "' ya está declarada", tokenId);
                }
                
                declaracion.agregarHijo(new NodoAST("IDENTIFICADOR", identificador));
                avanzarToken();
                
                while (tokenActual != null && verificarLexema(",")) {
                    consumir(",");
                    
                    if (tokenActual != null && esIdentificador(tokenActual.lexema)) {
                        Token sigTokenId = tokenActual;
                        String sigIdentificador = tokenActual.lexema;
                        
                        String sigTipo = obtenerTipoPorPrefijo(sigIdentificador);
                        
                        EntradaTS sigEntrada = tablaSimbolos.agregarVariable(sigIdentificador, sigTipo, sigTokenId.linea);
                        if (sigEntrada == null) {
                            errorSemantico("La variable '" + sigIdentificador + "' ya está declarada", sigTokenId);
                        }
                        
                        declaracion.agregarHijo(new NodoAST("IDENTIFICADOR", sigIdentificador));
                        avanzarToken();
                    } else {
                        errorSintactico("Se esperaba un identificador después de ','");
                    }
                }
            } else {
                errorSintactico("Se esperaba un identificador después de 'var'");
            }
            
            consumir(";");
        }
        
        return declaracion;
    }
    
    // TIPO -> entero | real | cadena | vacio
    private NodoAST analizarTipo() {
        NodoAST tipo = new NodoAST("TIPO", "");
        
        if (tokenActual != null) {
            String lexema = tokenActual.lexema;
            if (lexema.equals("entero") || lexema.equals("real") || 
                lexema.equals("cadena") || lexema.equals("vacio") || lexema.equals("int")) {
                tipo.valor = lexema;
                avanzarToken();
            } else {
                errorSintactico("Se esperaba un tipo de dato (entero, int, real, cadena, vacio)");
            }
        }
        
        return tipo;
    }
    
    private String obtenerPrefijoPorTipo(String tipo) {
        switch (tipo) {
            case "entero": return "&";
            case "real": return "%";
            case "cadena": return "$";
            case "vacio": return "";
            default: return "";
        }
    }
    
    // METODOS -> METODO METODOS | ε
    private NodoAST analizarMetodos() {
        NodoAST metodos = new NodoAST("METODOS", "");
        
        while (tokenActual != null && verificarLexema("metodo")) {
            metodos.agregarHijo(analizarMetodo());
        }
        
        return metodos;
    }
    
    // METODO -> metodo TIPO @id ( PARAMETROS ) { SENTENCIAS }
    private NodoAST analizarMetodo() {
        NodoAST metodo = new NodoAST("METODO", "");
        
        consumir("metodo");
        
        NodoAST tipoRetorno = analizarTipo();
        metodo.valor = tipoRetorno.valor;
        
        if (tokenActual != null && tokenActual.lexema.startsWith("@")) {
            String nombreMetodo = tokenActual.lexema;
            Token tokenMetodo = tokenActual;
            
            // AGREGAR MÉTODO A TABLA DE SÍMBOLOS
            EntradaTS entradaMetodo = tablaSimbolos.agregarAmbito(nombreMetodo, "metodo", tokenMetodo.linea);
            if (entradaMetodo == null) {
                errorSemantico("El método '" + nombreMetodo + "' ya está declarado", tokenMetodo);
            } else {
                // AGREGAR A TABLA DE DIRECCIONES
                tablaDirecciones.agregarEntrada(nombreMetodo, "-21", String.valueOf(tokenMetodo.linea), "metodo");
            }
            
            metodo.agregarHijo(new NodoAST("NOMBRE_METODO", nombreMetodo));
            avanzarToken();
            consumir("(");
            metodo.agregarHijo(analizarParametros());
            consumir(")");
            consumir("{");
            metodo.agregarHijo(analizarSentencias());
            consumir("}");
            
            tablaSimbolos.salirAmbito();
        } else {
            errorSintactico("Se esperaba un identificador de método (@nombre)");
        }
        
        return metodo;
    }
    
    // PARAMETROS -> PARAMETRO MAS_PARAMETROS | ε
    private NodoAST analizarParametros() {
        NodoAST parametros = new NodoAST("PARAMETROS", "");
        
        if (tokenActual != null && !verificarLexema(")")) {
            parametros.agregarHijo(analizarParametro());
            
            while (tokenActual != null && verificarLexema(",")) {
                consumir(",");
                parametros.agregarHijo(analizarParametro());
            }
        }
        
        return parametros;
    }
    
    // PARAMETRO -> IDENTIFICADOR
    private NodoAST analizarParametro() {
        NodoAST parametro = new NodoAST("PARAMETRO", "");
        
        if (tokenActual != null && esIdentificador(tokenActual.lexema)) {
            Token tokenId = tokenActual;
            String identificador = tokenActual.lexema;
            
            String tipo = obtenerTipoPorPrefijo(identificador);
            parametro.valor = tipo;
            
            EntradaTS entrada = tablaSimbolos.agregarVariable(identificador, tipo, tokenId.linea);
            if (entrada == null) {
                errorSemantico("El parámetro '" + identificador + "' ya está declarado", tokenId);
            }
            
            parametro.agregarHijo(new NodoAST("IDENTIFICADOR", identificador));
            avanzarToken();
        } else {
            errorSintactico("Se esperaba un identificador como parámetro");
        }
        
        return parametro;
    }
    
    // SENTENCIAS -> SENTENCIA SENTENCIAS | ε
    private NodoAST analizarSentencias() {
        NodoAST sentencias = new NodoAST("SENTENCIAS", "");
        
        while (tokenActual != null && !verificarLexema("}")) {
            sentencias.agregarHijo(analizarSentencia());
        }
        
        return sentencias;
    }
    
    // SENTENCIA -> ASIGNACION | CONDICIONAL | CICLO | ESCRITURA | LECTURA 
    //           | INCREMENTO | DECREMENTO | RETORNO | SWITCH
    private NodoAST analizarSentencia() {
        NodoAST sentencia = new NodoAST("SENTENCIA", "");
        
        if (tokenActual == null) {
            return sentencia;
        }
        
        String lexema = tokenActual.lexema;
        
        if (esIdentificador(lexema)) {
            Token tokenVar = tokenActual;
            String variable = lexema;
            
            EntradaTS entrada = tablaSimbolos.buscarSimbolo(variable);
            if (entrada == null) {
                errorSemantico("Variable '" + variable + "' no declarada", tokenVar);
            }
            
            avanzarToken();
            
            if (tokenActual != null) {
                switch (tokenActual.lexema) {
                    case "=":
                        sentencia = new NodoAST("ASIGNACION", variable);
                        consumir("=");
                        sentencia.agregarHijo(analizarExpresion());
                        
                        if (entrada != null && sentencia.hijos.size() > 0) {
                            NodoAST exp = sentencia.hijos.get(0);
                            if (exp.valor != null && !exp.valor.isEmpty()) {
                                tablaSimbolos.actualizarValor(variable, exp.valor);
                            }
                        }
                        break;
                        
                    case "++":
                        sentencia = new NodoAST("INCREMENTO", variable);
                        avanzarToken();
                        break;
                        
                    case "--":
                        sentencia = new NodoAST("DECREMENTO", variable);
                        avanzarToken();
                        break;
                        
                    case "+=":
                    case "-=":
                    case "*=":
                    case "/=":
                        String operador = tokenActual.lexema;
                        sentencia = new NodoAST("ASIGNACION_COMPUESTA", variable + operador);
                        avanzarToken();
                        sentencia.agregarHijo(analizarExpresion());
                        break;
                        
                    case "(":
                        sentencia = new NodoAST("LLAMADA_METODO", variable);
                        consumir("(");
                        sentencia.agregarHijo(analizarArgumentos());
                        consumir(")");
                        break;
                        
                    default:
                        errorSintactico("Se esperaba un operador después de '" + variable + "'");
                }
            }
            
            if (!sentencia.tipo.equals("LLAMADA_METODO")) {
                consumir(";");
            }
            
        } else {
            switch (lexema) {
                case "var":
                    sentencia = analizarDeclaracion();
                    break;
                case "si":
                    sentencia = analizarCondicional();
                    break;
                case "mientras":
                    sentencia = analizarCicloMientras();
                    break;
                case "repite":
                    sentencia = analizarCicloRepite();
                    break;
                case "escribir":
                    sentencia = analizarEscritura();
                    break;
                case "leer":
                    sentencia = analizarLectura();
                    break;
                case "switch":
                    sentencia = analizarSwitch();
                    break;
                case "regresar":
                    sentencia = analizarRetorno();
                    break;
                case "limpiar":
                    sentencia = new NodoAST("LIMPIAR", "");
                    consumir("limpiar");
                    consumir(";");
                    break;
                case "salir":
                    sentencia = new NodoAST("SALIR", "");
                    consumir("salir");
                    consumir(";");
                    break;
                default:
                    errorSintactico("Sentencia no válida: " + lexema);
                    while (tokenActual != null && !verificarLexema(";") && !verificarLexema("}")) {
                        avanzarToken();
                    }
                    if (tokenActual != null && verificarLexema(";")) {
                        avanzarToken();
                    }
            }
        }
        
        return sentencia;
    }
    
    private NodoAST analizarCondicional() {
        NodoAST condicional = new NodoAST("CONDICIONAL", "");
        consumir("si");
        consumir("(");
        condicional.agregarHijo(analizarExpresionBooleana());
        consumir(")");
        consumir("{");
        condicional.agregarHijo(analizarSentencias());
        consumir("}");
        
        if (tokenActual != null && verificarLexema("sino")) {
            consumir("sino");
            consumir("{");
            condicional.agregarHijo(analizarSentencias());
            consumir("}");
        }
        
        return condicional;
    }
    
    private NodoAST analizarCicloMientras() {
        NodoAST ciclo = new NodoAST("CICLO_MIENTRAS", "");
        consumir("mientras");
        consumir("(");
        ciclo.agregarHijo(analizarExpresionBooleana());
        consumir(")");
        consumir("{");
        ciclo.agregarHijo(analizarSentencias());
        consumir("}");
        return ciclo;
    }
    
    private NodoAST analizarCicloRepite() {
        NodoAST ciclo = new NodoAST("CICLO_REPITE", "");
        consumir("repite");
        consumir("(");
        ciclo.agregarHijo(analizarExpresion());
        consumir(")");
        consumir("{");
        ciclo.agregarHijo(analizarSentencias());
        consumir("}");
        return ciclo;
    }
    
    private NodoAST analizarExpresion() {
        NodoAST expresion = new NodoAST("EXPRESION", "");
        expresion.agregarHijo(analizarTermino());
        
        while (tokenActual != null && 
               (verificarLexema("+") || verificarLexema("-"))) {
            NodoAST operador = new NodoAST("OPERADOR", tokenActual.lexema);
            avanzarToken();
            NodoAST terminoDerecho = analizarTermino();
            operador.agregarHijo(expresion.hijos.remove(expresion.hijos.size() - 1));
            operador.agregarHijo(terminoDerecho);
            expresion.agregarHijo(operador);
        }
        
        return expresion;
    }
    
    private NodoAST analizarTermino() {
        NodoAST termino = new NodoAST("TERMINO", "");
        termino.agregarHijo(analizarFactor());
        
        while (tokenActual != null && 
               (verificarLexema("*") || verificarLexema("/") || verificarLexema("%"))) {
            NodoAST operador = new NodoAST("OPERADOR", tokenActual.lexema);
            avanzarToken();
            NodoAST factorDerecho = analizarFactor();
            operador.agregarHijo(termino.hijos.remove(termino.hijos.size() - 1));
            operador.agregarHijo(factorDerecho);
            termino.agregarHijo(operador);
        }
        
        return termino;
    }
    
    private NodoAST analizarFactor() {
        NodoAST factor = new NodoAST("FACTOR", "");
        
        if (tokenActual == null) return factor;
        
        if (verificarLexema("(")) {
            consumir("(");
            factor = analizarExpresion();
            factor.tipo = "AGRUPACION";
            consumir(")");
        } 
        else if (esConstante(tokenActual.tipo)) {
            factor.valor = tokenActual.lexema;
            factor.tipo = tokenActual.tipo;
            avanzarToken();
        } 
        else if (esIdentificador(tokenActual.lexema)) {
            String identificador = tokenActual.lexema;
            Token tokenId = tokenActual;
            
            EntradaTS entrada = tablaSimbolos.buscarSimbolo(identificador);
            if (entrada == null) {
                errorSemantico("Identificador '" + identificador + "' no declarado", tokenId);
            }
            
            factor.valor = identificador;
            avanzarToken();
            
            if (tokenActual != null && verificarLexema("(")) {
                NodoAST llamada = new NodoAST("LLAMADA_METODO", identificador);
                consumir("(");
                llamada.agregarHijo(analizarArgumentos());
                consumir(")");
                return llamada;
            }
        } 
        else if (verificarLexema("posxy")) {
            NodoAST llamada = new NodoAST("LLAMADA_POSXY", "posxy");
            consumir("posxy");
            consumir("(");
            llamada.agregarHijo(analizarArgumentos());
            consumir(")");
            return llamada;
        }
        else {
            errorSintactico("Se esperaba un factor válido, se encontró: " + tokenActual.lexema);
            avanzarToken();
        }
        
        return factor;
    }
    
    private NodoAST analizarArgumentos() {
        NodoAST argumentos = new NodoAST("ARGUMENTOS", "");
        
        if (tokenActual != null && !verificarLexema(")")) {
            argumentos.agregarHijo(analizarExpresion());
            
            while (tokenActual != null && verificarLexema(",")) {
                consumir(",");
                argumentos.agregarHijo(analizarExpresion());
            }
        }
        
        return argumentos;
    }
    
    private NodoAST analizarExpresionBooleana() {
        NodoAST exprBool = new NodoAST("EXPRESION_BOOL", "");
        
        if (tokenActual != null && verificarLexema("!")) {
            NodoAST not = new NodoAST("NOT", "!");
            consumir("!");
            not.agregarHijo(analizarExpresionBooleana());
            return not;
        }
        
        NodoAST exprIzq = analizarExpresion();
        exprBool.agregarHijo(exprIzq);
        
        if (tokenActual != null && esOperadorRelacional(tokenActual.lexema)) {
            NodoAST operador = new NodoAST("OP_RELACIONAL", tokenActual.lexema);
            avanzarToken();
            NodoAST exprDer = analizarExpresion();
            operador.agregarHijo(exprIzq);
            operador.agregarHijo(exprDer);
            return operador;
        }
        
        return exprBool;
    }
    
    private boolean esOperadorRelacional(String lexema) {
        return lexema.equals("<") || lexema.equals(">") || lexema.equals("<=") || 
               lexema.equals(">=") || lexema.equals("==") || lexema.equals("!=");
    }
    
    private NodoAST analizarEscritura() {
        NodoAST escritura = new NodoAST("ESCRITURA", "");
        consumir("escribir");
        consumir("(");
        escritura.agregarHijo(analizarExpresion());
        
        while (tokenActual != null && verificarLexema(",")) {
            consumir(",");
            escritura.agregarHijo(analizarExpresion());
        }
        
        consumir(")");
        consumir(";");
        return escritura;
    }
    
    private NodoAST analizarLectura() {
        NodoAST lectura = new NodoAST("LECTURA", "");
        consumir("leer");
        consumir("(");
        
        if (tokenActual != null && esIdentificador(tokenActual.lexema)) {
            Token tokenVar = tokenActual;
            String variable = tokenActual.lexema;
            
            EntradaTS entrada = tablaSimbolos.buscarSimbolo(variable);
            if (entrada == null) {
                errorSemantico("Variable '" + variable + "' no declarada para lectura", tokenVar);
            }
            
            lectura.valor = variable;
            avanzarToken();
        } else {
            errorSintactico("Se esperaba un identificador para leer");
        }
        
        consumir(")");
        consumir(";");
        return lectura;
    }
    
    private NodoAST analizarRetorno() {
        NodoAST retorno = new NodoAST("RETORNO", "");
        consumir("regresar");
        
        if (!verificarLexema(";")) {
            retorno.agregarHijo(analizarExpresion());
        }
        
        consumir(";");
        return retorno;
    }
    
    private NodoAST analizarSwitch() {
        NodoAST switchNode = new NodoAST("SWITCH", "");
        consumir("switch");
        consumir("(");
        
        if (tokenActual != null && esIdentificador(tokenActual.lexema)) {
            switchNode.valor = tokenActual.lexema;
            avanzarToken();
        }
        
        consumir(")");
        consumir("{");
        
        while (tokenActual != null && verificarLexema("encaso")) {
            NodoAST caso = new NodoAST("CASO", "");
            consumir("encaso");
            
            if (tokenActual != null && esConstante(tokenActual.tipo)) {
                caso.valor = tokenActual.lexema;
                avanzarToken();
                consumir(":");
                caso.agregarHijo(analizarSentencias());
            }
            
            switchNode.agregarHijo(caso);
        }
        
        consumir("}");
        return switchNode;
    }
    
    // ==========================================
    // MÉTODOS DE VISUALIZACIÓN
    // ==========================================
    
    public void mostrarTablaTokens() {
        String[] columnas = {"Posición", "Cadena", "N° Token", "Tipo", "Línea"};
        DefaultTableModel modelo = new DefaultTableModel(columnas, 0);
        
        int posicion = 1;
        for (Token token : tokens) {
            String tipoValor = "-1";
            if (token.tipo.startsWith("Identificador")) {
                tipoValor = "-2";
            }
            
            modelo.addRow(new String[]{
                String.valueOf(posicion++),
                token.lexema,
                token.numToken,
                tipoValor,
                String.valueOf(token.linea)
            });
        }
        
        JTable tabla = new JTable(modelo);
        tabla.setAutoResizeMode(JTable.AUTO_RESIZE_ALL_COLUMNS);
        JScrollPane scroll = new JScrollPane(tabla);
        
        JFrame ventana = new JFrame("Tabla de Tokens - Analizador Léxico");
        ventana.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        ventana.setSize(900, 600);
        ventana.add(scroll);
        ventana.setLocationRelativeTo(null);
        ventana.setVisible(true);
    }
    
    public void mostrarTablaSimbolos() {
        System.out.println(tablaSimbolos.mostrarTabla());
        
        String[] columnas = {"ID", "TK", "VALOR", "D1", "D2", "PTR", "AMBITO"};
        DefaultTableModel modelo = new DefaultTableModel(columnas, 0);
        
        List<EntradaTS> entradas = tablaSimbolos.getTodasEntradas();
        for (EntradaTS entrada : entradas) {
            if (entrada.id.startsWith("@")) {
                continue;
            }
            modelo.addRow(entrada.toArraySimbolos());
        }
        
        JTable tabla = new JTable(modelo);
        tabla.setAutoResizeMode(JTable.AUTO_RESIZE_ALL_COLUMNS);
        tabla.setFont(new java.awt.Font("Monospaced", java.awt.Font.PLAIN, 14));
        tabla.setRowHeight(25);
        
        JScrollPane scroll = new JScrollPane(tabla);
        
        JFrame ventana = new JFrame("Tabla de Símbolos");
        ventana.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        ventana.setSize(850, 500);
        ventana.add(scroll);
        ventana.setLocationRelativeTo(null);
        ventana.setVisible(true);
    }
    
    // NUEVO: Mostrar Tabla de Direcciones
    public void mostrarTablaDirecciones() {
        System.out.println(tablaDirecciones.mostrarTabla());
        
        String[] columnas = {"ID", "TK", "#LIN", "VCI"};
        DefaultTableModel modelo = new DefaultTableModel(columnas, 0);
        
        List<EntradaDireccion> entradas = tablaDirecciones.getEntradas();
        for (EntradaDireccion entrada : entradas) {
            modelo.addRow(entrada.toArray());
        }
        
        JTable tabla = new JTable(modelo);
        tabla.setAutoResizeMode(JTable.AUTO_RESIZE_ALL_COLUMNS);
        tabla.setFont(new java.awt.Font("Monospaced", java.awt.Font.PLAIN, 14));
        tabla.setRowHeight(25);
        
        // Colorear filas alternadas
        tabla.setDefaultRenderer(Object.class, new javax.swing.table.DefaultTableCellRenderer() {
            @Override
            public Component getTableCellRendererComponent(JTable table, Object value,
                    boolean isSelected, boolean hasFocus, int row, int column) {
                Component c = super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column);
                if (!isSelected) {
                    if (row % 2 == 0) {
                        c.setBackground(new java.awt.Color(255, 240, 240));
                    } else {
                        c.setBackground(java.awt.Color.WHITE);
                    }
                }
                if (column == 3) { // Columna VCI
                    c.setFont(new java.awt.Font("Monospaced", java.awt.Font.BOLD, 14));
                }
                return c;
            }
        });
        
        JScrollPane scroll = new JScrollPane(tabla);
        
        JFrame ventana = new JFrame("Tabla de Direcciones");
        ventana.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        ventana.setSize(650, 400);
        ventana.add(scroll);
        ventana.setLocationRelativeTo(null);
        
        // Panel con información adicional
        JPanel panelSur = new JPanel(new BorderLayout());
        JTextArea infoArea = new JTextArea();
        infoArea.setEditable(false);
        infoArea.setFont(new java.awt.Font("Monospaced", java.awt.Font.PLAIN, 12));
        infoArea.setBackground(new java.awt.Color(255, 250, 240));
        infoArea.setText("VCI = Índice de Código Virtual (posición en el segmento de código)\n" +
                        "#LIN = Número de línea donde se declaró la entidad\n" +
                        "Total de entidades: " + entradas.size());
        panelSur.add(infoArea, BorderLayout.CENTER);
        panelSur.setPreferredSize(new java.awt.Dimension(650, 60));
        
        ventana.add(panelSur, java.awt.BorderLayout.SOUTH);
        ventana.setVisible(true);
    }
    
    public void mostrarErrores() {
        StringBuilder sb = new StringBuilder();
        
        if (errores.isEmpty() && advertencias.isEmpty()) {
            sb.append("✓ No se encontraron errores ni advertencias.\n");
            sb.append("✓ El programa es sintáctica y semánticamente correcto.\n");
        } else {
            if (!errores.isEmpty()) {
                sb.append("=== ERRORES ENCONTRADOS ===\n\n");
                for (String error : errores) {
                    sb.append("❌ ").append(error).append("\n");
                }
                sb.append("\nTotal de errores: ").append(errores.size()).append("\n\n");
            }
            
            if (!advertencias.isEmpty()) {
                sb.append("=== ADVERTENCIAS ===\n\n");
                for (String advertencia : advertencias) {
                    sb.append("⚠️  ").append(advertencia).append("\n");
                }
                sb.append("\nTotal de advertencias: ").append(advertencias.size()).append("\n");
            }
        }
        
        JTextArea textArea = new JTextArea(sb.toString());
        textArea.setEditable(false);
        textArea.setFont(new java.awt.Font("Monospaced", java.awt.Font.PLAIN, 12));
        JScrollPane scroll = new JScrollPane(textArea);
        
        JFrame ventana = new JFrame("Resultados del Análisis");
        ventana.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        ventana.setSize(800, 500);
        ventana.add(scroll);
        ventana.setLocationRelativeTo(null);
        ventana.setVisible(true);
    }
    
    public void mostrarAST(NodoAST raiz) {
        if (raiz == null) {
            JOptionPane.showMessageDialog(null, "No se pudo generar el AST debido a errores.");
            return;
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append("=== ÁRBOL DE SINTAXIS ABSTRACTA (AST) ===\n\n");
        raiz.imprimir(sb, 0);
        
        JTextArea textArea = new JTextArea(sb.toString());
        textArea.setEditable(false);
        textArea.setFont(new java.awt.Font("Monospaced", java.awt.Font.PLAIN, 12));
        JScrollPane scroll = new JScrollPane(textArea);
        
        JFrame ventana = new JFrame("Árbol de Sintaxis Abstracta");
        ventana.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        ventana.setSize(900, 700);
        ventana.add(scroll);
        ventana.setLocationRelativeTo(null);
        ventana.setVisible(true);
    }
    
    // ==========================================
    // MÉTODO PRINCIPAL
    // ==========================================
    
    public static void main(String[] args) {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        JFileChooser fileChooser = new JFileChooser();
        fileChooser.setDialogTitle("Selecciona el archivo de código fuente");
        
        int resultado = fileChooser.showOpenDialog(null);
        if (resultado != JFileChooser.APPROVE_OPTION) {
            JOptionPane.showMessageDialog(null, "No seleccionaste ningún archivo.");
            return;
        }
        
        String rutaArchivo = fileChooser.getSelectedFile().getAbsolutePath();
        System.out.println("Archivo seleccionado: " + rutaArchivo);
        
        Compilador compilador = new Compilador();
        
        // FASE 1: Análisis Léxico
        System.out.println("\n=== FASE 1: ANÁLISIS LÉXICO ===");
        compilador.analizarLexico(rutaArchivo);
        System.out.println("Tokens encontrados: " + compilador.tokens.size());
        compilador.mostrarTablaTokens();
        
        for (Token token : compilador.tokens) {
            System.out.println(token);
        }
        
        // FASE 2: Análisis Sintáctico y Semántico
        System.out.println("\n=== FASE 2: ANÁLISIS SINTÁCTICO Y SEMÁNTICO ===");
        NodoAST arbolSintaxis = compilador.analizarPrograma();
        
        // MOSTRAR TABLA DE SÍMBOLOS
        compilador.mostrarTablaSimbolos();
        
        // MOSTRAR TABLA DE DIRECCIONES (NUEVA)
        compilador.mostrarTablaDirecciones();
        
        // Mostrar errores y advertencias
        compilador.mostrarErrores();
        
        // Mostrar AST si no hay errores
        if (arbolSintaxis != null && compilador.errores.isEmpty()) {
            // compilador.mostrarAST(arbolSintaxis); // Ocultado a petición del usuario
        }
        
        // Resumen final
        System.out.println("\n=== RESUMEN DEL ANÁLISIS ===");
        System.out.println("Tokens procesados: " + compilador.tokens.size());
        System.out.println("Errores encontrados: " + compilador.errores.size());
        System.out.println("Advertencias: " + compilador.advertencias.size());
        
        if (compilador.errores.isEmpty()) {
            System.out.println("✓ El análisis se completó exitosamente.");
        } else {
            System.out.println("✗ Se encontraron errores durante el análisis.");
        }
    }
}