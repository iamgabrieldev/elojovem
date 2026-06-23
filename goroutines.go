package main

import (
	"fmt"
	"sync"
)

func main() {
	// Usar WaitGroup para sincronizar goroutines
	var wg sync.WaitGroup
	
	// Canal para comunicação entre goroutines
	results := make(chan string, 5)
	
	// Definir número de goroutines
	tasks := []string{"Task 1", "Task 2", "Task 3", "Task 4", "Task 5"}
	
	// Adicionar goroutines ao WaitGroup
	wg.Add(len(tasks))
	
	// Lançar goroutines
	for _, task := range tasks {
		go func(t string) {
			defer wg.Done()
			// Simular trabalho
			result := fmt.Sprintf("%s concluída", t)
			results <- result
		}(task)
	}
	
	// Goroutine para fechar canal após todas terminarem
	go func() {
		wg.Wait()
		close(results)
	}()
	
	// Consumir resultados do canal
	for result := range results {
		fmt.Println(result)
	}
	
	fmt.Println("Todas as tarefas concluídas!")
}
