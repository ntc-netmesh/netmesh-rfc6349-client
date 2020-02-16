// Client side implementation of UDP client-server model 
#include <stdio.h> 
#include <stdlib.h> 
#include <signal.h> 
#include <unistd.h> 
#include <string.h> 
#include <sys/types.h> 
#include <sys/socket.h> 
#include <arpa/inet.h> 
#include <netinet/in.h> 
#include <netinet/tcp.h> 

// global var holding socket file descriptor
int* the_client_socket;


void sighandler(int signum) {
   printf("Caught signal %d, coming out...\n", signum);
   close(*the_client_socket);
   exit(1);
}

// Driver code 
int main(int argc, char** argv) { 
	char* serverip = argv[1]
	int PORT = atoi(argv[2]);
	int MAXLINE = atoi(argv[3]);
	int sockfd, n; 
	char buffer[MAXLINE]; 
	char* hello = malloc(MAXLINE * sizeof(char));
	the_client_socket = &sockfd;
	signal(SIGINT, sighandler);
    memset(hello, '.', MAXLINE*sizeof(char)); 
	struct sockaddr_in	 servaddr; 

	// Creating socket file descriptor 
	if ( (sockfd = socket(AF_INET, SOCK_STREAM, 0)) < 0 ) { 
		perror("socket creation failed"); 
		exit(EXIT_FAILURE); 
	} 

	memset(&servaddr, 0, sizeof(servaddr)); 
	
	// Filling server information 
	// SETS THE SERVER ADDRESS TO THE ADDRESS OF THIS
	// PC, WHICH IS ALIASED AS INADDR_ANY
	//servaddr.sin_addr.s_addr = INADDR_ANY; 
	//inet_aton("192.168.85.251", &servaddr.sin_addr );
	//inet_aton("202.92.132.191", &servaddr.sin_addr );
	inet_aton(serverip, &servaddr.sin_addr );
	servaddr.sin_family = AF_INET; 
	servaddr.sin_port = htons(PORT); 
	
	// SOCKET OPTIONS FOR SPECIAL NMP
	//int maxseg = MAXLINE+66;
	int maxseg = MAXLINE;
	//int maxbuf = 1500*2;
	int one = 1;
    //if (setsockopt(sockfd, SOL_SOCKET,  SO_SNDBUF,    &maxbuf, sizeof(maxbuf)) < 0) 
    //    perror("ERROR setting SO_SNDBUF");
	setsockopt(sockfd, IPPROTO_TCP, TCP_MAXSEG,   &maxseg, sizeof(maxseg));
	//setsockopt(sockfd, IPPROTO_TCP, TCP_NODELAY,  &one, sizeof(one));
    if (connect(sockfd,(struct sockaddr *)&servaddr,sizeof(servaddr)) < 0) 
        perror("ERROR connecting");
	int len; 
	int cont;
	cont = 0;
	while(cont > -1){
		setsockopt(sockfd, IPPROTO_TCP, TCP_QUICKACK, &one, sizeof(one));
		n = write(sockfd, hello, strlen(hello));
		if (n < 0) 
			 perror("ERROR writing to socket");
		bzero(buffer,MAXLINE);
		//n = read(sockfd,buffer,MAXLINE);
		//if (n < 0) 
		//	 perror("ERROR reading from socket");
		//printf("%s\n",buffer);
		cont++;
	}
	close(sockfd); 
	
	return 0; 
} 

