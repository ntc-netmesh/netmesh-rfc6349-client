// Server side implementation of UDP client-server model 
#include <stdio.h> 
#include <stdlib.h> 
#include <unistd.h> 
#include <string.h> 
#include <sys/types.h> 
#include <sys/socket.h> 
#include <arpa/inet.h> 
#include <netinet/in.h> 
  
#define PORT     3001 
#define MAXLINE 65536 

#include "mtu.h"
#include "mtu.c"

// Driver code 
int main() { 
    int sockfd; 
    char buffer[MAXLINE]; 
    //char *hello = "Hello from server"; 
    struct sockaddr_in servaddr, cliaddr; 
      
    // Creating socket file descriptor 
    if ( (sockfd = socket(AF_INET, SOCK_DGRAM, 0)) < 0 ) { 
        perror("socket creation failed"); 
        exit(EXIT_FAILURE); 
    } 
      
    memset(&servaddr, 0, sizeof(servaddr)); 
    memset(&cliaddr, 0, sizeof(cliaddr)); 
      
    // Filling server information 
    servaddr.sin_family    = AF_INET; // IPv4 
    servaddr.sin_addr.s_addr = INADDR_ANY; 
    servaddr.sin_port = htons(PORT); 
      
    // Bind the socket with the server address 
    if ( bind(sockfd, (const struct sockaddr *)&servaddr,  
            sizeof(servaddr)) < 0 ) 
    { 
        perror("bind failed"); 
        exit(EXIT_FAILURE); 
    } 
    /*
    int yes =1;
	const int* val = &yes;
    setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, (char *)MTU_DEFAULT_TIMEOUT, sizeof(MTU_DEFAULT_TIMEOUT));
    setsockopt(sockfd, IPPROTO_IP, IP_HDRINCL, val, sizeof(yes));
	*/
/*
    
    while(1){  
	    int n;
	    socklen_t len; 
	    n = recvfrom(sockfd, (char *)buffer, MAXLINE,  
	                MSG_WAITALL, ( struct sockaddr *) &cliaddr, 
	                &len); 
	    buffer[n] = '\0'; 
	    printf("Client : %s\n", buffer); 
	    sendto(sockfd, buffer, strlen(buffer),  
	        MSG_CONFIRM, (const struct sockaddr *) &cliaddr, 
	            len); 
	    //printf("Hello message sent.\n");  
    }
    */
    
    int n,res;
    socklen_t len = sizeof(struct sockaddr_in);
    char format_addr[16] = {0};

    	if ((n = recvfrom(sockfd, (char *)buffer, MAXLINE, MSG_WAITALL, (struct sockaddr*) &cliaddr, &len)<0)){
    		printf("%s\n",strerror(n));
    	}
    	//buffer[n] = '\0';
        printf("Client : %s\n", buffer ); 
        char buf [INET_ADDRSTRLEN];
        printf("Client : %s\n", inet_ntop(AF_INET, &(cliaddr.sin_addr), buf, INET_ADDRSTRLEN)); 
        printf("%d\n", ntohs(cliaddr.sin_port));
        printf("%d\n", n);

        /*
        sendto(sockfd, buffer, strlen(buffer),  
	        MSG_CONFIRM, (const struct sockaddr *) &cliaddr, 
	            len); 
		*/
        //res = mtu_reverse(&servaddr, &cliaddr, MTU_PROTO_UDP, MTU_DEFAULT_RETRIES, MTU_DEFAULT_TIMEOUT,sockfd);
        res = mtu_discovery(&servaddr, &cliaddr, MTU_PROTO_UDP, MTU_DEFAULT_RETRIES, MTU_DEFAULT_TIMEOUT);

        if (res < 0)
        {
            if (res == MTU_ERR_TIMEOUT)
                fprintf(stderr, "No reply from %s.\n", inet_ntop(AF_INET, &cliaddr.sin_addr, format_addr, 16));
        }
        else
            printf("\nPLPMTUD to %s: %d bytes (20 IPv4 header + 8 %s header + %d data).\n", inet_ntop(AF_INET, &cliaddr.sin_addr, format_addr, 16), res, "UDP", res - MTU_IPSIZE - MTU_UDPSIZE);
    

    return 0; 
} 