// Server side implementation of UDP client-server model 
#include <stdio.h> 
#include <stdlib.h> 
#include <unistd.h> 
#include <string.h> 
#include <sys/types.h> 
#include <sys/socket.h> 
#include <arpa/inet.h> 
#include <netinet/in.h> 
#include <netinet/tcp.h> 
#include <signal.h> 

  
#define PORT     8080 
#define MAXLINE 1360
  
// global var holding socket file descriptor
int* the_server_socket;


void sighandler(int signum) {
   printf("Caught signal %d, coming out...\n", signum);
   close(*the_server_socket);
   exit(1);
}
// Driver code 
int main() { 
    int sockfd, newsockfd; 
	int n;
	the_server_socket = &sockfd;
	signal(SIGINT, sighandler);
    char buffer[MAXLINE]; 
    //char *hello = "Hello from server"; 
	char* hello = (char*)malloc(64 * sizeof(char));
	//// ALWAYS RETURN 64 BYTES OF DATA
	memset(hello, '.', 64*sizeof(char)); 
    struct sockaddr_in servaddr, cliaddr; 
      
    // Creating socket file descriptor 
    if ( (sockfd = socket(AF_INET, SOCK_STREAM, 0)) < 0 ) { 
        perror("socket creation failed"); 
        exit(EXIT_FAILURE); 
    } 
      
    memset(&servaddr, 0, sizeof(servaddr)); 
    memset(&cliaddr, 0, sizeof(cliaddr)); 
      
    // Filling server information 
    servaddr.sin_family    = AF_INET; // IPv4 
    servaddr.sin_addr.s_addr = INADDR_ANY; 
    servaddr.sin_port = htons(PORT); 
	int one = 1;
	int maxbuf = 1500*2;
	setsockopt(sockfd, SOL_SOCKET, SO_RCVBUF, &maxbuf, sizeof(maxbuf));
	setsockopt(sockfd, IPPROTO_TCP, TCP_NODELAY, &one, sizeof(one));
      
    // Bind the socket with the server address 
    if ( bind(sockfd, (const struct sockaddr *)&servaddr,  
            sizeof(servaddr)) < 0 ) 
    { 
        perror("bind failed"); 
        exit(EXIT_FAILURE); 
    } 
      
    int clilen; 
	listen(sockfd,100);
	clilen = sizeof(cliaddr);
	int nostringcounter;
ACCEPTER:newsockfd = accept(sockfd, (struct sockaddr *) &cliaddr, &clilen);
	nostringcounter = 0;
	

	
	while(1){
		// recv
		bzero(buffer,MAXLINE);
		setsockopt(sockfd, IPPROTO_TCP, TCP_QUICKACK, &one, sizeof(one));
		n = read(newsockfd,buffer,MAXLINE);
		if (n < 0) perror("ERROR reading from socket");
		if(strstr(buffer, hello) != NULL) {
			printf("Here is the message length: %lu\n",sizeof(buffer));
			nostringcounter = 0;
		} else {
			printf("no string");
			nostringcounter++;
			if (nostringcounter > 100){
				goto ACCEPTER;
			}
		}

		//n = write(newsockfd, buffer ,strlen(buffer));
		//if (n < 0) perror("ERROR writing to socket");
	}
      
    return 0; 
} 

